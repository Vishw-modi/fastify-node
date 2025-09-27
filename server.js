import { error } from "console";
import fastify from "fastify";
import { read } from "fs";
import fs from "fs/promises";
const app = fastify({ logger: true });

const readUser = async () => {
  try {
    const data = await fs.readFile("user.json", "utf8");
    const users = JSON.parse(data);
    return users;
  } catch (error) {
    console.error("Error reading user data:", error);
  }
  return [];
};

const writeUser = async (user) => {
  try {
    await fs.writeFile("user.json", JSON.stringify(user, null, 2));
    console.log("User data written successfully");
  } catch (error) {
    console.error("Error writing user data:", error);
  }
};

app.get("/", async (req, res) => {
  res.code(200);
  return await readUser();
});

app.post("/api/users", async (req, res) => {
  const { name, age } = req.body;
  if (!name || !age) {
    res.code(400);
    return { error: "Name and age are required" };
  }

  const users = await readUser();
  const newUser = {
    id: users.length + 1,
    name,
    age,
  };
  users.push(newUser);
  await writeUser(users);
  res.code(201);
  return { message: "User added successfully", user: newUser };
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  const users = await readUser();
  const userIndex = users.findIndex((user) => user.id === parseInt(id));
  if (userIndex === -1) {
    res.code(404);
    return { error: "User not found" };
  }

  const deletedUsed = users.splice(userIndex, 1)[0];
  await writeUser(users);
  res.code(200);
  return { message: "User deleted successfully", user: deletedUsed };
});

app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const users = await readUser();
  const user = users.find((user) => user.id === parseInt(id));
  if (!user) {
    res.code(404);
    return { error: "User not found" };
  }
  res.code(200);
  return user;
});

app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, age } = req.body;
  if (!name || !age) {
    res.code(400);
    return { error: "Name and age are required" };
  }
  const users = await readUser();
  let userIndex = users.findIndex((user) => user.id === parseInt(id));
  if (userIndex === -1) {
    res.code(404);
    return { error: "User not found" };
  }

  users[userIndex] = { ...users[userIndex], name, age };
  await writeUser(users);
  res.code(200);
  return {
    message: "User updated successfully",
    updatedUser: users[userIndex],
  };
});

app.setNotFoundHandler((req, res) => {
  res.code(404);
  return { error: "Route not found" };
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log("Server is running at http://localhost:3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
