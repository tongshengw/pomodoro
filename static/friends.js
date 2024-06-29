

async function loadFriends(friends, friendRequests) {
    try {
        const response = await fetch("api/load-friends");
        let json = response.json();
        console.log(json);
    } catch (error) {
        console.error(error.message);
    }
}

async function sendFriendRequest(recipientId) {
    try {
        const response = await fetch("api/add-friends", {
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

export {loadFriends, sendFriendRequest};