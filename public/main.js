async function fetchBlogs(category, forUser) {
  let blogs = [];

  var token = localStorage.getItem("token");

  if (!token) {
    // display error - user has to login first
  }

  if (category) {
    // fetch blogs for that category

    const req = await fetch(
      `http://localhost:7000/api/blogs?category=${category}`,
      {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        }
      }
    );
    const res = await req.json(); // parses JSON response into native JavaScript objects
    console.log("res : ", res);

    blogs = res;
    return blogs;
  }

  if (forUser) {
    const req = await fetch("http://localhost:7000/api/blogs?myBlogs=true", {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      }
    });
    const res = await req.json(); // parses JSON response into native JavaScript objects
    console.log("res : ", res);

    blogs = res;
    return blogs;
  }

  // else fetch all blogs

  const req = await fetch("http://localhost:7000/api/blogs", {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    }
  });
  const res = await req.json(); // parses JSON response into native JavaScript objects
  console.log("res : ", res);

  blogs = res;

  return blogs;
}

async function renderBlogs(category = null, forUser = false) {
  const blogs = await fetchBlogs(category, forUser);

  const blogsToRender = blogs.map(
    blog => `
        <h2>
            <b>${blog.title}</b>
        </h2>
        <div>
            ${blog.content}
        </div>
        `
  );

  document.getElementById("renderBlogs").innerHTML = blogsToRender;
}

window.onload = function() {
  // getQueryStringParams();
  // const url = new URL(location.search);
  // const category = url.searchParams.get("category");
  // console.log("category : ", category)

  console.log("location.search : ", location.search);
  const queryParams = parse_query_string(location.search);
  console.log("queryParams : ", queryParams);

  const myBlogs = queryParams["?myBlogs"];
  console.log("myBlogs : ", myBlogs);

  const category = queryParams["?category"];
  console.log("category : ", category);

  if (category) {
    return renderBlogs(category);
  }

  if (myBlogs) {
    return renderBlogs(null, true);
  }

  return this.renderBlogs();
};

// -------------------------- SIGN UP ------------------------------
async function signUp() {
  console.log("signup");
  var signUpName = document.getElementById("signUpName").value;
  var signUpEmail = document.getElementById("signUpEmail").value;
  var signUpPassword = document.getElementById("signUpPassword").value;

  console.log("signUpName : ", signUpName);
  console.log("signUpEmail : ", signUpEmail);
  console.log("signUpPassword : ", signUpPassword);

  const data = {
    name: signUpName,
    email: signUpEmail,
    password: signUpPassword
  };

  const req = await fetch("http://localhost:7000/api/signup", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    // mode: "cors", // no-cors, *cors, same-origin
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  const res = await req.json(); // parses JSON response into native JavaScript objects
  console.log("res : ", res);

  if (res.token) {
    localStorage.setItem("token", res.token);
  }

  if (res.err) {
    // display error
  }
}

// ------------------------- LOGIN ----------------------------

async function login() {
  console.log("login");
  var loginEmail = document.getElementById("loginEmail").value;
  var loginPassword = document.getElementById("loginPassword").value;

  console.log("loginEmail : ", loginEmail);
  console.log("loginPassword : ", loginPassword);

  const data = {
    email: loginEmail,
    password: loginPassword
  };

  const req = await fetch("http://localhost:7000/api/login", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    // mode: "cors", // no-cors, *cors, same-origin
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  const res = await req.json(); // parses JSON response into native JavaScript objects
  console.log("res : ", res);

  if (res.token) {
    localStorage.setItem("token", res.token);
  }

  if (res.err) {
    // display error
  }
}

// ------------------------- HELPER ---------------------------

function getQueryStringParams() {
  const urlParams = new URLSearchParams(window.location.search);
  console.log("urlParams : ", urlParams);
  // const myParam = urlParams.get('myParam');
}

function parse_query_string(query) {
  var vars = query.split("&");
  var query_string = {};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    var key = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1]);
    // If first entry with this name
    if (typeof query_string[key] === "undefined") {
      query_string[key] = decodeURIComponent(value);
      // If second entry with this name
    } else if (typeof query_string[key] === "string") {
      var arr = [query_string[key], decodeURIComponent(value)];
      query_string[key] = arr;
      // If third or later entry with this name
    } else {
      query_string[key].push(decodeURIComponent(value));
    }
  }
  return query_string;
}
