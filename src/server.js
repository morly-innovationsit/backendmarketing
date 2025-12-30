const app = require('./app');
const mongoclient = require('./database/index');

require("dotenv").config();

const port = process.env.PORT || 8060;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
