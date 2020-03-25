const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sign, authenticate } = require("./helper/authenticate");
const { hash, decode } = require("./helper/password");

const app = express();
const PORT = 7000;

app.use(bodyParser.json());
app.use(cors());

// connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/blogapp", { useNewUrlParser: true })
  .then(() => {
    console.info("Database Connected!!!");
  })
  .catch(err => {
    console.error("Unable to connect to database : ", err);
  });

const BlogModel = require("./models/BlogModel");
const UserModel = require("./models/UserModel");
const categories = require("./categories");

// require User, Blogs and category enum
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body; //hash password to do
    console.log("email : ", email);
    const user = await UserModel.findOne({ email });

    console.log("user : ", user);

    if (!user) {
      return res.send({ err: true, err_msg: "User not found" });
    }

    const hashedPassword = user.password;
    const decoded = await decode(password, hashedPassword);
    console.log("decoded : ", decoded);

    if (!decoded) {
      return res
        .status(403)
        .json({ err: true, err_msg: "Passwords do not match" });
    }

    const token = sign(user);
    res.status(200).json({ success: true, token });
  } catch (error) {
    throw error;
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res
        .status(403)
        .json({ err: true, err_msg: "Email already exists" });
    }

    const hashedPassword = await hash(password);
    console.log("hashedPassword : ", hashedPassword);

    const user = await new UserModel({
      name,
      email,
      password: hashedPassword
    }).save();

    const token = sign(user);
    res.status(200).json({ success: true, token });
  } catch (error) {
    throw error;
  }
});

app.get("/api/blogs", async (req, res) => {
  // READ
  // fetch all blogs
  try {
    const token = req.headers.authorization;
    console.log("token : ", token);
    const auth = await authenticate(token);

    if (auth.err) {
      return res.status(403).json({ err: auth.err_msg });
    }

    let response;

    const getBlogsForUser = req.query.myBlogs;
    console.log("getBlogsForUser : ", getBlogsForUser);

    const { category } = req.query;
    console.log("category : ", category);

    if (getBlogsForUser) {
      const { userId } = auth;
      response = await BlogModel.find({ userId });
      return res.status(200).json(response);
    }

    if (category) {
      response = await BlogModel.find({ category });
      return res.status(200).json(response);
    }

    response = await BlogModel.find();
    res.status(200).json(response);
  } catch (error) {
    throw error;
  }
});

app.get("/api/user", async (req, res) => {
  // READ
  // fetch all users

  try {
    const token = req.headers.authorization;

    const auth = await authenticate(token);

    if (auth.err) {
      return res.status(403).json({ err: auth.err_msg });
    }

    const user = await UserModel.find({});
    res.json(user);
  } catch (error) {
    throw error;
  }
});

app.get("/api/blogs", async (req, res) => {
  // READ
  // fetch all blogs for a user
  try {
    const token = req.headers.authorization;

    const auth = await authenticate(token);
    if (auth.err) {
      return res.status(403).json({ err: auth.err_msg });
    }

    const { userId } = auth;

    const userBlogs = await BlogModel.find({ userId });
    res.status(200).json(userBlogs);
  } catch (error) {
    throw error;
  }
});

/*app.get("/api/blog/:category", async (req, res) => {
  try {
    const { category } = req.params;
    if (!category || !categories.includes(category)) {
      console.log("category : ", category);
    }
    const blogCat = await BlogModel.find({ category });
    res.json(blogCat);
  } catch (error) {
    console.error("/api/blog/:category Failed : ", error);
  }
});*/
app.get("/api/user/:email", async (req, res) => {
  try {
    const token = req.headers.authorization;

    const auth = await authenticate(token);
    if (auth.err) {
      return res.status(403).json({ err: auth.err_msg });
    }

    const { email } = req.params;
    if (!email) {
      console.log("not a valid email id  ");
    }

    const user = await UserModel.find({ email });
    res.status(200).json(user);
  } catch (error) {
    throw error;
  }
});

app.post("/api/blogs", async (req, res) => {
  // CREATE
  // insert a blog for a user

  try {
    const token = req.headers.authorization;

    const auth = await authenticate(token);
    if (auth.err) {
      return res.status(403).json({ err: auth.err_msg });
    }
    console.log("req.body : ", req.body);

    const { title, content, userId, category } = req.body;
    if (!userId) {
      return res.send({ error: "Userid is required" });
    }

    const blog = await new BlogModel({
      title,
      content,
      userId,
      category
    }).save();
    res.status(200).json(blog);
  } catch (error) {
    throw error;
  }
});

app.put("/api/blogs/", async (req, res) => {
  // UPDATE
  // update a blog for a user
  // validate if the user has the access to update that blog
  try {
    const token = req.headers.authorization;

    const auth = await authenticate(token);
    if (auth.err) {
      return res.status(403).json({ err: auth.err_msg });
    }
    const { blogId, title, content } = req.body; // object destructuring

    if (!blogId) {
      return res.send({ error: "enter a valid id" });
    }

    const updatedblog = await BlogModel.update(
      { _id: blogId },
      { title, content }
    );

    res.status(200).json(updatedblog);
  } catch (error) {
    throw error;
  }
});

app.delete("/api/blogs/:blogId", async (req, res) => {
  // DELETE
  // delete a blog for a user
  // validate if the user has the access to delete that blog
  try {
    const token = req.headers.authorization;

    const auth = await authenticate(token);
    if (auth.err) {
      return res.status(403).json({ err: auth.err_msg });
    }

    const { blogId } = req.params;
    if (!blogId) {
      return res.send({ error: "enter a valid id" });
    }

    await BlogModel.remove({ _id: blogId });
    res.status(200).json({ success: true }); //specify obj
  } catch {
    throw error;
  }
});

app.listen(PORT, () => {
  console.info(`App is now running at port : ${PORT}`);
});
