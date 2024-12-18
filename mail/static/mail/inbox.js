document.addEventListener('DOMContentLoaded', function() {

  // Load inbox by default
  load_mailbox('inbox');

  // Event listeners for each NavBar button - use to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email("New Email"));

  // Email handling
  document.addEventListener('click', event => {

    // Get email's unique id
    const email = event.target.dataset.email;

    // Check if the user clicked view button and, if so, view that email
    if (event.target.className === 'btn btn-sm btn-primary view float-right') {
      view_email(email);
    }

    // Check if the user clicked archive button and, if so, archive email and return to inbox view
    else if (event.target.className === 'btn btn-sm btn-secondary archive float-right') {
      archive_email(email);
    }
  });

  // Execute when compose email form submitted
  document.querySelector('#compose-form').onsubmit = function() {

    // Load inbox
    load_mailbox('inbox');

    // 'Send' email via POST request (API /emails route)
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
        })
      })

      .then(response => response.json())
      .then(result => {
        console.log(result); // Debug
      });

    // Prevent form from submitting (default behaviour)
    return false;
  };
});


// Function: display compose email view and clear previous form contents
function compose_email(state, email) {

  // Set title to 'New Email' or 'Reply' as appropriate
  document.querySelector('#NewOrReply').innerHTML = state

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out any previous values from form fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  if (state === "Reply") {

    // Auto fill form with reply elements (Re., sender, etc.)
    document.querySelector('#compose-recipients').value = `${email.sender}`;
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body} \r\n\r\n --- \r\n\r\n`;
  }
}


// Function: view mailboxes. Called by clicking NavBar buttons. Three valid mailboxes / arguments: inbox, sent, and archive
function load_mailbox(mailbox) {

  // Show mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show capitalised mailbox name (passed in as argument)
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // View 1 of 3: Inbox
  if (mailbox === 'inbox') {
    console.log('Debug: viewing inbox.');

    // GET request to API route 'emails/inbox' > converts to JSON > returns array of emails as variable emails
    fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {
        console.log(emails); // Debug

        // Check if any emails to display. If none, display message
        if (emails.length === 0) {
          const empty = document.createElement("div");
          empty.innerHTML = "No emails to display..."
          document.querySelector('#emails-view').appendChild(empty);
        }

        // For each email in array, create div with styling (style.css), and add to page
        for (let email in emails) {

          const item = document.createElement("div");
          item.className = "email";
          item.innerHTML = `Email from <b>${emails[email].sender}</b> recieved <b>${emails[email].timestamp}</b>. Subject: <b>${emails[email].subject}</b>.`

          // Add view button to div
          var viewButton = document.createElement("button");
          viewButton.className = 'btn btn-sm btn-primary view float-right'
          viewButton.dataset.email = emails[email].id
          viewButton.innerHTML = "View"
          item.appendChild(viewButton)

          // If email has been read, display as grey otherwise white
          if (emails[email].read === true) {
            item.className += ' read';
          } else {
            item.className += ' unread';
          }

          // If email has NOT been archived, add archive button
          if (emails[email].archived === false) {
            var archiveButton = document.createElement("button");
            archiveButton.className = 'btn btn-sm btn-secondary archive float-right'
            archiveButton.dataset.email = emails[email].id
            archiveButton.innerHTML = "Archive"
            item.appendChild(archiveButton)
          }

          // Add populated div to page
          document.querySelector('#emails-view').appendChild(item);
        }
      })
  }

  // View 2 of 3: sent
  else if (mailbox === 'sent') {

    fetch('/emails/sent')
      .then(response => response.json())
      .then(emails => {
        console.log(emails); // Debug

        // Check if any emails to display. If none, display message
        if (emails.length === 0) {
          const empty = document.createElement("div");
          empty.innerHTML = "No emails to display..."
          document.querySelector('#emails-view').appendChild(empty);
        }

        for (let email in emails) {
          const item = document.createElement("div");
          item.className = "email";
          item.innerHTML = `Email to <b>${emails[email].recipients}</b> sent <b>${emails[email].timestamp}</b>. Subject: <b>${emails[email].subject}</b>.`

          var viewButton = document.createElement("button");
          viewButton.className = 'btn btn-sm btn-primary view float-right'
          viewButton.dataset.email = emails[email].id
          viewButton.innerHTML = "View"
          item.appendChild(viewButton)

          document.querySelector('#emails-view').appendChild(item);
        }
      });

    // Archive view
  } else if (mailbox === 'archive') {

    fetch('/emails/archive')
      .then(response => response.json())
      .then(emails => {
        console.log(emails); // Debug

        // Check if any emails to display. If none, display message
        if (emails.length === 0) {
          const empty = document.createElement("div");
          empty.innerHTML = "No emails to display..."
          document.querySelector('#emails-view').appendChild(empty);
        }

        for (let email in emails) {
          var archiveItem = document.createElement("div");
          archiveItem.className = "email";
          archiveItem.innerHTML = `Email from <b>${emails[email].sender}</b> recieved <b>${emails[email].timestamp}</b>`

          var viewButton = document.createElement("button");
          viewButton.className = 'btn btn-sm btn-primary view float-right'
          viewButton.dataset.email = emails[email].id
          viewButton.innerHTML = "View"
          archiveItem.appendChild(viewButton)

          if (emails[email].archived === true) {
            var archiveButton = document.createElement("button");
            archiveButton.className = 'btn btn-sm btn-secondary archive float-right'
            archiveButton.dataset.email = emails[email].id
            archiveButton.innerHTML = "Unarchive"
            archiveItem.appendChild(archiveButton)
          }
          document.querySelector('#emails-view').appendChild(archiveItem);
        }
      })
  }
};

// Function: view single email and mark as read
function view_email(email) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Mark email as read
  fetch(`/emails/${email}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  // Display email contents
  fetch(`/emails/${email}`)
    .then(response => response.json())
    .then(email => {
      console.log(email); // Debug

      // Plug values into template in index.html
      var from = document.getElementById('from')
      from.innerHTML = email.sender
      var to = document.getElementById('to')
      to.innerHTML = email.recipients
      var subject = document.getElementById('subject')
      subject.innerHTML = email.subject
      var date = document.getElementById('date')
      date.innerHTML = email.timestamp
      var emailBody = document.getElementById('emailBody')
      emailBody.innerHTML = email.body

      // Add reply button
      reply = document.getElementById('replyButton');

      // Handling for when button clicked
      reply.onclick = function() {
        document.querySelector('#email-view').style.display = 'none';
        compose_email("Reply", email);
      }
    })
}

// Function: archive and unarchive email
async function archive_email(email) {

  const result = await fetch(`/emails/${email}`)
  data = await result.json()

  if (data.archived === true) {
    fetch(`/emails/${email}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
    console.log("Email archived")

  } else {
    fetch(`/emails/${email}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
    console.log("Email unarchived")
  }

  location.reload(load_mailbox('inbox'))
}
