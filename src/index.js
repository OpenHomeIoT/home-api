import HubApi from "./HubApi.js";

const hubApi = new HubApi();
hubApi.start("0.0.0.0", 30027)
.then(() => console.log(`API listening on 0.0.0.0:30027`));
