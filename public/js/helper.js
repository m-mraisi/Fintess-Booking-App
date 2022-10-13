// helper functions for fetch request PUT and DELETE
const removeUser = (user_email) => {
    fetch(`/users/delete/${user_email}`, {
      method: "DELETE",
    }).then((res) => {
      return window.location.replace("/admin");
    });
  };

const updateUser = (user_email) => {
    //no validation since we allow empty strings
    const body = {
        name: document.getElementById("name").value,
        password: document.getElementById("password").value,
    }
    console.log(body);
    fetch(`/users/update/${user_email}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    }).then((res) => {
        return window.location.replace("/admin");
    });
};

const updateClass = (class_id) => {
    //no validation since we allow empty strings
    const body = {
        classInstructor: document.getElementById('name').value
    }
    console.log(body);
    fetch(`/classes/update/${class_id}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    }).then((res) => {
        return window.location.replace("/admin");
    });
};
