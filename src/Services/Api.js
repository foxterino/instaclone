export class Api {
  getData = (databaseName, id) => {
    let temp;
    database.ref(`${databaseName}/${id}/`);
    temp =data.toJSON();
    return data;
  }
  temp = undefined;
}