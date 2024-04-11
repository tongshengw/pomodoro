async function checkUsername(username, usernameElement, submitButton) {
    try {
        const response = await fetch("api/check-username", {method:"POST", headers:{"Content-Type":"application/json",}, body:JSON.stringify({username:username}),});

        const result = await response.json();
        console.log(result)
        // false when username is NOT IN database, true when username IS IN database
        if (result === false) {
            usernameElement.style.border = ("green solid");
            submitButton.disabled = false;
        }
        else {
            usernameElement.style.border = ("red solid")
            submitButton.disabled = true;
        }

    } catch (error) {
        console.log("checkUsername error")
        console.log(error)
    }
}

async function checkEmail(email, emailElement, submitButton) {
    try {
        const response = await fetch("api/check-email", {method:"POST", headers:{"Content-Type":"application/json",}, body:JSON.stringify({email:email}),});

        const result = await response.json();
        console.log(result);
        // false when username is NOT IN database, true when username IS IN database
        if (result === false) {
            emailElement.style.border = ("green solid");
            submitButton.disabled = false;
        }
        else {
            emailElement.style.border = ("red solid");
            submitButton.disabled = true;
        }

    } catch (error) {
        console.log("checkUsername error");
        console.log(error);
    }
}


function checkPass(confirm, pass) {
    if (pass.value === confirm.value) {
        confirm.style.border = ("green solid")
        submitButton.disabled = false;
    } else {
        confirm.style.border = ("red solid");
            submitButton.disabled = true;
    }
}


export {checkUsername, checkEmail, checkPass}