// Wait for the DOM to fully load before executing the script
document.addEventListener('DOMContentLoaded', function() {
    // Load the inbox mailbox by default
    load_mailbox('inbox');

    // Set up event listeners for mailbox navigation buttons
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', () => compose_email("New Email"));

    // Set up a click event listener for email actions
    document.addEventListener('click', event => {
        const email = event.target.dataset.email; // Get the email ID from the clicked element

        // If the clicked element is a button to view the email
        if (event.target.className === 'button-email-view') {
            view_email(email); // Call the function to view the email
        } else if (event.target.className === 'button-email-archieve') {
            archive_email(email); // Call the function to archive/unarchive the email
        };
    });

    // Handle the submission of the compose email form
    document.querySelector('#compose-form').onsubmit = function() {
        load_mailbox('inbox'); // Load the inbox after sending the email

        // Send a POST request to create a new email
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: document.querySelector('#compose-recipients').value,
                subject: document.querySelector('#compose-subject').value,
                body: document.querySelector('#compose-body').value
            })
        })
        .then(response => response.json()) // Parse the JSON response
        .then(result => {
            console.log(result); // Log the result for debugging
        });

        return false; // Prevent the default form submission behavior
    };
});

// Function to set up the compose email view
function compose_email(state, email) {
    document.querySelector('#NewOrReply').innerHTML = state; // Set the state (New or Reply)

    // Hide other views and show the compose view
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear the compose form fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    // If replying to an email, populate the fields with the original email's data
    if (state === "Reply") {
        document.querySelector('#compose-recipients').value = `${email.sender}`;
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body} \r\n\r\n --- \r\n\r\n`;
    };
};

function load_mailbox(mailbox) {
    // Display the emails-view section and hide the others
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';

    // Set the title of the emails-view section based on the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    if (mailbox === 'inbox') {
        // Handle inbox: fetch and display emails
        console.log('Debug: viewing inbox.');

        fetch('/emails/inbox')
        .then(response => response.json())
        .then(emails => {
            console.log(emails);

            // Display a message if no emails are found
            if (emails.length === 0) {
                const empty = document.createElement("div");
                empty.innerHTML = "No emails to display..."
                document.querySelector('#emails-view').appendChild(empty);
            };

            // Loop through each email and display its details
            for (let email in emails) {
                const item = document.createElement("div");
                item.className = "email";
                item.innerHTML = `Email from: <b>${emails[email].sender}</b> received <b>${emails[email].timestamp}</b> Subject: <b>${emails[email].subject}</b>`

                // Create a button to view the email
                var viewButton = document.createElement("button");
                viewButton.className = 'button-email-view'
                viewButton.dataset.email = emails[email].id
                viewButton.innerHTML = "View"
                item.appendChild(viewButton)

                // Mark email as read or unread
                if (emails[email].read === true) {
                    item.className += ' read';
                } else {
                    item.className += ' unread';
                };

                // Add an archive button for unarchived emails
                if (emails[email].archived === false) {
                    var archiveButton = document.createElement("button");
                    archiveButton.className = 'button-email-archieve'
                    archiveButton.dataset.email = emails[email].id
                    archiveButton.innerHTML = "Archive"
                    item.appendChild(archiveButton)
                };

                document.querySelector('#emails-view').appendChild(item);
            };
        });
    } else if (mailbox === 'sent') {
        // Handle sent mailbox: fetch and display sent emails
        fetch('/emails/sent')
        .then(response => response.json())
        .then(emails => {
            console.log(emails);

            // Display a message if no emails are found
            if (emails.length === 0) {
                const empty = document.createElement("div");
                empty.innerHTML = "No emails to display..."
                document.querySelector('#emails-view').appendChild(empty);
            };

            // Loop through each email and display its details
            for (let email in emails) {
                const item = document.createElement("div");
                item.className = "email";
                item.innerHTML = `Email to <b>${emails[email].recipients}</b> sent <b>${emails[email].timestamp}</b>. Subject: <b>${emails[email].subject}</b>.`

                // Create a button to view the email
                var viewButton = document.createElement("button");
                viewButton.className = 'button-email-view'
                viewButton.dataset.email = emails[email].id
                viewButton.innerHTML = "View"
                item.appendChild(viewButton)

                document.querySelector('#emails-view').appendChild(item);
            };
        });
    } else if (mailbox === 'archive') {
        // Handle archive mailbox: fetch and display archived emails
        fetch('/emails/archive')
        .then(response => response.json())
        .then(emails => {
            console.log(emails);

            // Display a message if no emails are found
            if (emails.length === 0) {
                const empty = document.createElement("div");
                empty.innerHTML = "No emails to display..."
                document.querySelector('#emails-view').appendChild(empty);
            };

            // Loop through each email and display its details
            for (let email in emails) {
                var archiveItem = document.createElement("div");
                archiveItem.className = "email";
                archiveItem.innerHTML = `Email from: <b>${emails[email].sender}</b> received <b>${emails[email].timestamp}</b>`

                // Create a button to view the email
                var viewButton = document.createElement("button");
                viewButton.className = 'button-email-view'
                viewButton.dataset.email = emails[email].id
                viewButton.innerHTML = "View"
                archiveItem.appendChild(viewButton)

                // Add an unarchive button for archived emails
                if (emails[email].archived === true) {
                    var archiveButton = document.createElement("button");
                    archiveButton.className = 'button-email-archieve'
                    archiveButton.dataset.email = emails[email].id
                    archiveButton.innerHTML = "Unarchive"
                    archiveItem.appendChild(archiveButton)
                };

                document.querySelector('#emails-view').appendChild(archiveItem);
            };
        });
    };
};


function view_email(email) {
    // Hide the emails-view and compose-view sections, and display the email-view section
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';

    // Mark the email as read by sending a PUT request
    fetch(`/emails/${email}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    });

    // Fetch email details and display them
    fetch(`/emails/${email}`)
    .then(response => response.json())
    .then(email => {
        console.log(email); // Debug: log the email details

        // Populate email details in the respective fields
        var from = document.getElementById('from');
        from.innerHTML = email.sender;
        var to = document.getElementById('to');
        to.innerHTML = email.recipients;
        var subject = document.getElementById('subject');
        subject.innerHTML = email.subject;
        var date = document.getElementById('date');
        date.innerHTML = email.timestamp;
        var emailBody = document.getElementById('emailBody');
        emailBody.innerHTML = email.body;

        // Set up the reply button to compose a reply email
        reply = document.getElementById('replyButton');

        reply.onclick = function() {
            document.querySelector('#email-view').style.display = 'none';
            compose_email("Reply", email);
        };
    });
};

async function archive_email(email) {
    // Fetch the current email data
    const result = await fetch(`/emails/${email}`);
    data = await result.json();

    // Toggle the archived status of the email
    if (data.archived === true) {
        fetch(`/emails/${email}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
        });

        console.log("Email archived");
    } else {
        fetch(`/emails/${email}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
        });

        console.log("Email unarchived");
    };

    // Reload the inbox to reflect changes
    location.reload(load_mailbox('inbox'));
};