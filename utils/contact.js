import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { v4 as secure } from "@lukeed/uuid/secure";

const dirDocument = "./assets/documents";
const contactPath = `${dirDocument}/contacts.json`;

if (!existsSync(dirDocument)) {
  mkdirSync(dirDocument, { recursive: true });
}

if (!existsSync(contactPath)) {
  writeFileSync(contactPath, "[]", "utf-8");
}

const loadContacts = () => {
  const getFile = readFileSync(contactPath, "utf-8");
  const data = JSON.parse(getFile);

  return data;
};

const findContact = (id) => {
  const getContacts = loadContacts();
  return getContacts.find((contact) => contact.id == id);
};

const saveContact = (contacts) => {
  writeFileSync(contactPath, JSON.stringify(contacts));
};

const addContact = (contact) => {
  const getContacts = loadContacts();
  contact["id"] = secure();
  getContacts.push(contact);
  saveContact(getContacts);
};

const updateContact = (id, contact) => {
  const getContacts = loadContacts();
  const index = getContacts.findIndex((contact) => contact.id == id);
  getContacts[index] = contact;
  getContacts[index]["id"] = id;
  saveContact(getContacts);
};

const deleteContact = (id) => {
  const getContacts = loadContacts();
  const filteredContact = getContacts.filter((contact) => contact.id !== id);
  saveContact(filteredContact);
};

const checkDuplicate = (key, value) => {
  const getContacts = loadContacts();
  return getContacts.find((contact) => contact[key] === value);
};

export {
  loadContacts,
  addContact,
  findContact,
  checkDuplicate,
  updateContact,
  deleteContact,
};
