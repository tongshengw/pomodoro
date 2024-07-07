

async function loadFriends(friends, friendRequests) {
    try {
        const response = await fetch("/api/load-friends", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify('lmao idk what to put here')
        });
        let json = await response.json();
        console.log('json')
        console.log(json);
        friends = json;

        populateFriends(friends)
    } catch (error) {
        console.error(error.message);
    }
}

async function sendFriendRequest(recipientId) {
    try {
        const response = await fetch("/api/add-friends", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"reciever_id":recipientId})
        });
    } catch (error) {
        console.error(error.message);
    }
}

function populateFriendRequests(friendRequests, tableElement) {

}

function populateFriends(friends) {
    const tableBody = document.querySelector('#friends-table tbody');
    // friends.forEach(item => {
    //     console.log(item)
    //     const row = document.createElement('tr');
        
    //     // Create and append cells to the row
    //     for (let key in item) {
    //         const cell = document.createElement('td');
    //         cell.textContent = item[key];
    //         row.appendChild(cell);
    //     }

    //     // Append the row to the table body
    //     tableBody.appendChild(row);
    // });
    console.log('loop')
    for (const key in friends) {
        console.log(key);
        const row = document.createElement('tr');

        const idCell = document.createElement('td');
        idCell.textContent=key;
        row.appendChild(idCell);

        const cell = document.createElement('td');
        cell.textContent = friends[key]['totalFocus'];
        row.appendChild(cell);

        const cell2 = document.createElement('td');
        cell2.textContent = friends[key]['totalRest'];
        row.appendChild(cell2);

        tableBody.appendChild(row);
    }
}

export {loadFriends, sendFriendRequest, populateFriendRequests, populateFriends};