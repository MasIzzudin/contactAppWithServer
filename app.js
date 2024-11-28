import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
import morgan from "morgan";
import moment from "moment";
import session from "express-session";
import cookieParser from "cookie-parser";
import flash from "connect-flash";

import { body, validationResult } from "express-validator";

import {
  loadContacts,
  addContact,
  findContact,
  checkDuplicate,
  updateContact,
  deleteContact,
} from "./utils/contact.js";

const app = express();
const port = 8080;
moment.locale("id");
var timeNow = "";

// ejs
app.set("view engine", "ejs");

//third party middleware
app.use(expressEjsLayouts);
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("secret"));
app.use(
  session({
    secret: "secret",
    cookie: { maxAge: 6000 },
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

//application middleware
app.use((req, res, next) => {
  timeNow = moment().format("dddd, DD MMMM yyyy");
  res.locals.timeNow = timeNow;
  res.locals.pathName = req.path;
  next();
});

//home
app.get("/", (req, res) => {
  res.render("home", {
    nama: "Capa kamu?",
    title: "Halaman Home",
    layout: "layouts/main-layout",
  });
});

//about
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "About",
  });
});

//contact
const duplicateContactValidator = (key, value) => {
  if (value != "") {
    let message = "";
    const contact = checkDuplicate(key, value);
    if (contact) {
      if (key == "email") message = "Email sudah terdaftar!";
      if (key == "phone") message = "Nomor hp sudah terdaftar!";

      throw Error(message);
    }
  }

  return true;
};

app.post(
  "/contact",
  [
    body("email", "Email tidak valid!")
      .isEmail()
      .custom(async (value) => duplicateContactValidator("email", value)),
    body("phone", "No Hp tidak valid!")
      .if(body("phone").not().equals(""))
      .isMobilePhone("id-ID")
      .custom(async (value) => duplicateContactValidator("phone", value)),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("contact-add", {
        title: "Tambahkan kontak",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      req.flash("msg", "Berhasil menambahkan kontak");
      res.redirect("/contact");
    }
  }
);

//update contact post method
app.post(
  "/contact/update/:id",
  [
    body("email", "Email tidak valid!").isEmail(),
    body("phone", "No Hp tidak valid!")
      .if(body("phone").not().equals(""))
      .isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body = req.body;
      body.id = req.params.id;
      res.render("contact-update", {
        title: "Edit kontak",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: body,
      });
    } else {
      updateContact(req.params.id, req.body);
      req.flash("msg", "Berhasil perbarui kontak");
      res.redirect("/contact");
    }
  }
);

//delete contact get method
app.get("/contact/delete/:id", (req, res) => {
  deleteContact(req.params.id);
  req.flash("msg", "Berhasil menghapus kontak");
  res.redirect("/contact");
});

app.get("/contact", (req, res) => {
  const contacts = loadContacts();
  res.render("contact", {
    layout: "layouts/main-layout",
    title: "Contact",
    contacts,
    messages: req.flash("msg"),
  });
});

app.get("/contact/add", (req, res) => {
  res.render("contact-add", {
    title: "Tambahkan kontak",
    layout: "layouts/main-layout",
  });
});

app.get("/contact/update/:id", (req, res) => {
  const contact = findContact(req.params.id);
  res.render("contact-update", {
    title: "Edit kontak",
    layout: "layouts/main-layout",
    contact,
  });
});

app.get("/contact/:id", (req, res) => {
  const contact = findContact(req.params.id);
  res.render("contact-detail", {
    title: "Detail kontak",
    layout: "layouts/main-layout",
    contact,
  });
});

//middleware if path not found
app.use("/", (req, res) => {
  res.status(404);
  res.send("<h1>404 Halaman tidak ditemukan</h1>");
});

//listen port
app.listen(port, () => {
  console.log(`listening to PORT ${port}`);
});
