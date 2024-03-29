import request from "supertest";
import { app } from "../../app";
import { natsClient } from "../../nats";
import { Domain } from "../../models/domain";
import { Email } from "../../models/email";

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
it("returns a 201 on successful signup", async (done) => {
  const response = await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "password",
    firstName: "Regular",
    lastName: "User",
    city: "Bogota",
    country: "Colombia",
    client: "Claro",
    office: "Sede Principal",
    mainTransportationMethod: "Carro",
    secondaryTransportationMethod: "Moto",
    termsDate: true,
    comodatoDate: true,
  });
  expect(response.status).toEqual(201);

  return done();
});

it("publishes and event when a new user is created", async (done) => {
  const response = await request(app).post("/api/users/signup").send({
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
  expect(natsClient.client.publish).toHaveBeenCalled();

  return done();
});

it("returns a 400 with an invalid email", async (done) => {
  const response = await request(app).post("/api/users/signup").send({
    email: "test.com",
    password: "password",
    firstName: "Regular",
    lastName: "User",
    city: "Bogota",
    country: "Colombia",
    mainTransportationMethod: "Carro",
    secondaryTransportationMethod: "Moto",
    termsDate: true,
    comodatoDate: true,
  });

  expect(response.status).toEqual(400);
  return done();
});

it("returns a 400 with an invalid password", async (done) => {
  const response = await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "",
    firstName: "Regular",
    lastName: "User",
    city: "Bogota",
    country: "Colombia",
    mainTransportationMethod: "Carro",
    secondaryTransportationMethod: "Moto",
    termsDate: true,
    comodatoDate: true,
  });
  expect(response.status).toEqual(400);
  return done();
});

it("returns a 400 with an invalid firstName", async (done) => {
  const response = await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "12345",
    firstName: "",
    lastName: "User",
    city: "Bogota",
    country: "Colombia",
    mainTransportationMethod: "Carro",
    secondaryTransportationMethod: "Moto",
    termsDate: true,
    comodatoDate: true,
  });
  expect(response.status).toEqual(400);
  return done();
});

it("returns a 400 with an invalid lastName", async (done) => {
  const response = await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "12345",
    firstName: "User",
    lastName: "",
    city: "Bogota",
    country: "Colombia",
    mainTransportationMethod: "Carro",
    secondaryTransportationMethod: "Moto",
    termsDate: true,
    comodatoDate: true,
  });
  expect(response.status).toEqual(400);
  return done();
});
it("returns a 400 with an invalid client", async (done) => {
  const response = await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "12345",
    firstName: "User",
    lastName: "Regular",
    client: "",
    office: "Sede Principal",
    mainTransportationMethod: "Carro",
    secondaryTransportationMethod: "Moto",
    termsDate: true,
    comodatoDate: true,
  });
  expect(response.status).toEqual(400);
  return done();
});
it("returns a 400 with an invalid office", async (done) => {
  const response = await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "12345",
    firstName: "User",
    lastName: "Regular",
    client: "Claro",
    office: "",
    mainTransportationMethod: "Carro",
    secondaryTransportationMethod: "Moto",
    termsDate: true,
    comodatoDate: true,
  });
  expect(response.status).toEqual(400);
  return done();
});
it("returns a 400 with an invalid main transportation", async (done) => {
  const response = await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "12345",
    firstName: "User",
    lastName: "Regular",
    client: "Claro",
    office: "Sede Principal",
    mainTransportationMethod: "",
    secondaryTransportationMethod: "Moto",
    termsDate: true,
    comodatoDate: true,
  });
  expect(response.status).toEqual(400);
  return done();
});
it("returns a 400 with an invalid secondary transportation", async (done) => {
  const response = await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "12345",
    firstName: "User",
    lastName: "Regular",
    client: "Claro",
    office: "Sede Principal",
    mainTransportationMethod: "Carro",
    secondaryTransportationMethod: "",
    termsDate: true,
    comodatoDate: true,
  });
  expect(response.status).toEqual(400);
  return done();
});
it("returns a 400 if terms are not accepted", async (done) => {
  const response = await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "12345",
    firstName: "User",
    lastName: "Regular",
    client: "Claro",
    office: "Sede Principal",
    mainTransportationMethod: "Carro",
    secondaryTransportationMethod: "Moto",
    termsDate: false,
    comodatoDate: true,
  });
  expect(response.status).toEqual(400);
  return done();
});
it("returns a 400 if comodato contract is not accepted", async (done) => {
  const response = await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "12345",
    firstName: "User",
    lastName: "Regular",
    client: "Claro",
    office: "Sede Principal",
    mainTransportationMethod: "Carro",
    secondaryTransportationMethod: "Moto",
    termsDate: true,
    comodatoDate: false,
  });
  expect(response.status).toEqual(400);
  return done();
});

it("disallows duplicate email", async (done) => {
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

  response = await request(app).post("/api/users/signup").send({
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
  expect(response.status).toEqual(400);

  return done();
});
