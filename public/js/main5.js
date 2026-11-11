'use strict';
const url = 'http://localhost:3000/api/v1'; // change url when uploading to server
const imageUrl = 'http://localhost:3000/uploads/'; // change url when uploading to server

// select existing html elements
const loginWrapper = document.querySelector('#login-wrapper');
const userInfo = document.querySelector('#user-info');
const logOut = document.querySelector('#log-out');
const main = document.querySelector('main');
const loginForm = document.querySelector('#login-form');
const addUserForm = document.querySelector('#add-user-form');
const addForm = document.querySelector('#add-cat-form');
const modForm = document.querySelector('#mod-cat-form');
const ul = document.querySelector('ul');
const userList = document.querySelector('.add-owner');
const imageModal = document.querySelector('#image-modal');
const modalImage = document.querySelector('#image-modal img');
const close = document.querySelector('#image-modal a');

// luxon date libary
const dt = luxon.DateTime;

// get user from sessionStorage
let user = JSON.parse(sessionStorage.getItem('user'));
console.log(user);
const startApp = (logged) => {
  console.log(logged);
  // show/hide forms + cats
  loginWrapper.style.display = logged ? 'none' : 'flex';
  logOut.style.display = logged ? 'block' : 'none';
  main.style.display = logged ? 'block' : 'none';
  userInfo.innerHTML = logged ? `Hello ${user.name}` : '';
  if (logged) {
    if (user?.role > 0) {
      userList.remove();
    }
    getCat();
    getUsers();
  }
};

// create cat cards
const createCatCards = (cats) => {
  // clear ul
  ul.innerHTML = '';
  cats.forEach((cat) => {
    // create li with DOM methods
    const img = document.createElement('img');
    img.src = imageUrl + cat.filename + '_thumb';
    img.alt = 'Image of a cat named ' + cat.cat_name;
    img.classList.add('resp');

    // open large image when clicking image
    img.addEventListener('click', () => {
      modalImage.src = imageUrl + cat.filename;
      imageModal.alt = cat.name;
      imageModal.classList.toggle('hide');
    });

    const figure = document.createElement('figure').appendChild(img);

    const h2 = document.createElement('h2');
    h2.innerHTML = cat.cat_name;

    const p1 = document.createElement('p');
    p1.innerHTML = `Birthdate: ${dt
      .fromISO(cat.birthdate)
      .setLocale('fi')
      .toLocaleString()}`;
    const p1b = document.createElement('p');
    p1b.innerHTML = `Age: ${dt
      .now()
      .diff(dt.fromISO(cat.birthdate), ['year'])
      .toFormat('y')}`;

    const p2 = document.createElement('p');
    p2.innerHTML = `Weight: ${cat.weight}kg`;

    const p3 = document.createElement('p');
    p3.innerHTML = `Owner: ${cat.owner_name}`;

    const li = document.createElement('li');
    li.classList.add('light-border');

    li.appendChild(h2);
    li.appendChild(figure);
    li.appendChild(p1);
    li.appendChild(p1b);
    li.appendChild(p2);
    li.appendChild(p3);
    ul.appendChild(li);
    if (user.role === 'admin' || user.user_id === cat.owner) {
      // add modify button
      const modButton = document.createElement('button');
      modButton.innerHTML = 'Modify';
      modButton.addEventListener('click', () => {
        const inputs = modForm.querySelectorAll('input');
        inputs[0].value = cat.cat_name;
        inputs[1].value = dt.fromISO(cat.birthdate).toFormat('yyyy-MM-dd');
        inputs[2].value = cat.weight;
        modForm.action = `${url}/cats/${cat.cat_id}`;
        if (user.role === 'admin') {
          modForm.querySelector('select').style.display = 'block';
          modForm.querySelector('select').value = cat.owner;
        } else {
          modForm.querySelector('select').style.display = 'none';
        }
      });

      // delete selected cat
      const delButton = document.createElement('button');
      delButton.innerHTML = 'Delete';
      delButton.addEventListener('click', async () => {
        const fetchOptions = {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer ' + sessionStorage.getItem('token'),
          },
        };
        try {
          const response = await fetch(
            url + '/cats/' + cat.cat_id,
            fetchOptions,
          );
          const json = await response.json();
          console.log('delete response', json);
          getCat();
        } catch (e) {
          console.log(e.message());
        }
      });
      li.appendChild(modButton);
      li.appendChild(delButton);
    }
  });
};

// close modal
close.addEventListener('click', (evt) => {
  evt.preventDefault();
  imageModal.classList.toggle('hide');
});

// AJAX call

const getCat = async () => {
  console.log('getCat token ', sessionStorage.getItem('token'));
  try {
    const options = {
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
    };
    const response = await fetch(url + '/cats', options);
    const cats = await response.json();
    createCatCards(cats);
  } catch (e) {
    console.log(e.message);
  }
};

// create user options to <select>
const createUserOptions = (users) => {
  // clear user list
  userList.innerHTML = '';
  users.forEach((user) => {
    // create options with DOM methods
    const option = document.createElement('option');
    option.value = user.user_id;
    option.innerHTML = user.name;
    option.classList.add('light-border');
    userList.appendChild(option);
  });
};

// get users to form options
const getUsers = async () => {
  try {
    const options = {
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
    };
    const response = await fetch(url + '/users', options);
    const users = await response.json();
    createUserOptions(users);
  } catch (e) {
    console.log(e.message);
  }
};

// submit add cat form
addForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const fd = new FormData(addForm);
  const fetchOptions = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: fd,
  };
  const response = await fetch(url + '/cats', fetchOptions);
  const json = await response.json();
  console.log('add response', json);
  getCat();
});

// submit modify form
modForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const data = serializeJson(modForm);
  const fetchOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: JSON.stringify(data),
  };

  console.log(fetchOptions);
  const response = await fetch(modForm.action, fetchOptions);
  const json = await response.json();
  console.log('modify response', json);
  getCat();
});

// login
loginForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const data = serializeJson(loginForm);
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(url + '/auth/login', fetchOptions);
  const json = await response.json();
  if (!json.user) {
    alert(json.error.message);
  } else {
    // save token and user
    sessionStorage.setItem('token', json.token);
    sessionStorage.setItem('user', JSON.stringify(json.user));
    user = JSON.parse(sessionStorage.getItem('user'));
    startApp(true);
  }
});

// logout
logOut.addEventListener('click', async (evt) => {
  evt.preventDefault();
  try {
    const options = {
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
    };
    const response = await fetch(url + '/auth/logout', options);
    const json = await response.json();
    console.log(json);
    // remove token
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    alert('You have logged out');
    startApp(false);
  } catch (e) {
    console.log(e.message);
  }
});

// submit register form
addUserForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const data = serializeJson(addUserForm);
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  const response = await fetch(url + '/auth/register', fetchOptions);
  const json = await response.json();
  if (json.error) {
    alert(json.error.message);
  } else {
    alert(json.message);
  }
});

// when app starts, check if token exists and hide login form, show logout button and main content, get cats and users
(async () => {
  if (sessionStorage.getItem('token') && sessionStorage.getItem('user')) {
    // check if token valid
    try {
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      };
      const response = await fetch(url + '/auth/me', fetchOptions);
      if (!response.ok) {
        startApp(false);
      } else {
        startApp(true);
      }
    } catch (e) {
      console.log(e.message);
    }
  } else {
    // when starting app and nothing in sessionStorage
    startApp(false);
  }
})();
