const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const app = require("./index");
const { port, DB_URL } = process.env;

mongoose
  .connect(DB_URL)
  .then(() => console.log(`MongoDb Connected`))
  .catch((err) => console.log(err));

app.listen(port || 3001, () => {
  console.log(`server running in ${process.env.NODE_ENV} mode on port ${port}`);
});
