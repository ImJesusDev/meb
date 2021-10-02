import request from "supertest";
import { app } from "../../app";
import { Domain } from "../../models/domain";
import { Email } from "../../models/email";
import { User } from "../../models/user";

beforeEach(async () => {
  const email = Email.build({
    email: "test@test.com",
    client: "Claro",
    office: "Sede Principal",
    active: true,
  });
  await email.save();
  const domain = Domain.build({
    domain: "test.com",
    client: "Claro",
    active: true,
  });
  await domain.save();
});
it("it can fetch a list of users", async (done) => {
  let users = await User.find({});
  expect(users.length).toEqual(0);
  let response = await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "password",
    firstName: "Regular",
    lastName: "User",
    client: "Claro",
    office: "Sede Principal",
    mainTransportationMethod: "Carro",
    secondaryTransportationMethod: "Moto",
    termsDate: true,
    comodatoDate: true,
  });
  expect(response.status).toEqual(201);
  users = await User.find({});
  expect(users.length).toEqual(1);

  response = await request(app).get("/api/users").send({});
  expect(response.status).toEqual(200);
  expect(response.body.users.length).toEqual(1);
  return done();
});
it("it can filter a list of users by role", async (done) => {
  let response = await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "password",
    firstName: "Regular",
    lastName: "User",
    client: "Claro",
    office: "Sede Principal",
    mainTransportationMethod: "Carro",
    secondaryTransportationMethod: "Moto",
    termsDate: true,
    comodatoDate: true,
  });
  expect(response.status).toEqual(201);

  response = await request(app).get("/api/users?role=user").send({});
  expect(response.status).toEqual(200);
  expect(response.body.users.length).toEqual(1);

  response = await request(app).get("/api/users?role=client-admin").send({});
  expect(response.status).toEqual(200);
  expect(response.body.users.length).toEqual(0);

  return done();
});
