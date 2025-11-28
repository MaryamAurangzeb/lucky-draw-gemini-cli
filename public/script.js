document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const drawButton = document.getElementById('draw-button');
    const viewParticipantsButton = document.getElementById('view-participants-button');
    const viewWinnersButton = document.getElementById('view-winners-button');

    const messageArea = document.getElementById('message-area');
    const winnerDisplay = document.getElementById('winner-display');
    
    const participantsList = document.getElementById('participants-list');
    const participantsUl = document.getElementById('participants-ul');
    
    const winnersList = document.getElementById('winners-list');
    const winnersUl = document.getElementById('winners-ul');

    // Helper to display messages
    const showMessage = (message, isError = false) => {
        messageArea.textContent = message;
        messageArea.className = isError ? 'error' : 'success';
        setTimeout(() => {
            messageArea.className = '';
        }, 4000);
    };

    // Helper to toggle visibility of result lists
    const toggleListView = (element) => {
        // Hide all lists first
        participantsList.style.display = 'none';
        winnersList.style.display = 'none';
        // Then show the requested one, if it was hidden
        if (element.style.display === 'none') {
            element.style.display = 'block';
        } else {
            element.style.display = 'none'; // Allow toggling off
        }
    };

    // 1. Handle Registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = e.target.name.value;
        const email = e.target.email.value;

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'An error occurred.');
            }
            showMessage(result.message);
            registerForm.reset();
        } catch (error) {
            showMessage(error.message, true);
        }
    });

    // 2. Handle Drawing a Winner
    drawButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/draw', { method: 'POST' });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to draw a winner.');
            }
            
            const { winner } = result;
            winnerDisplay.innerHTML = `
                <div class="winner-name">${winner.name}</div>
                <div class="winner-email">${winner.email}</div>
            `;
            showMessage('Congratulations to the new winner!');
            
            // Hide lists when a new winner is drawn
            participantsList.style.display = 'none';
            winnersList.style.display = 'none';

        } catch (error) {
            showMessage(error.message, true);
            winnerDisplay.innerHTML = `<p>${error.message}</p>`;
        }
    });

    // 3. Handle Viewing Participants
    viewParticipantsButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/participants');
            const result = await response.json();
            if (!result.success) throw new Error(result.message);

            participantsUl.innerHTML = ''; // Clear previous list
            if (result.participants.length === 0) {
                participantsUl.innerHTML = '<li>No participants yet.</li>';
            } else {
                result.participants.forEach(p => {
                    const li = document.createElement('li');
                    li.innerHTML = `<span>${p.name} (${p.email})</span> <span>ID: ${p.id}</span>`;
                    participantsUl.appendChild(li);
                });
            }
            toggleListView(participantsList);
        } catch (error) {
            showMessage(error.message, true);
        }
    });

    // 4. Handle Viewing Past Winners
    viewWinnersButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/winners');
            const result = await response.json();
            if (!result.success) throw new Error(result.message);

            winnersUl.innerHTML = ''; // Clear previous list
            if (result.winners.length === 0) {
                winnersUl.innerHTML = '<li>No winners have been drawn yet.</li>';
            } else {
                result.winners.forEach(w => {
                    const li = document.createElement('li');
                    const drawTime = new Date(w.draw_time).toLocaleString();
                    li.innerHTML = `<span>${w.name} (${w.email})</span> <span>Drawn: ${drawTime}</span>`;
                    winnersUl.appendChild(li);
                });
            }
            toggleListView(winnersList);
        } catch (error) {
            showMessage(error.message, true);
        }
    });
});
