var express = require("express");
var router = express.Router();
var http = require("http");
var fs = require("fs");
var fileUpload = require('express-fileupload');
var path = require('path');
var formidable = require("formidable");
const check = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;
var mv = require("mv");
var authentication_mdl = require("../middlewares/authentication");
var session_store;
/* GET nim page. */

router.get("/", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM guru",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("guru/list", {
          title: "Guru",
          data: rows,
          session_store: req.session,
        });
      }
    );
    //console.log(query.sql);
  });
});

router.delete(
  "/delete/(:id_guru)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var guru = {
        id_guru: req.params.id_guru,
      };

      var delete_sql = "delete from guru where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          guru,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/guru");
            } else {
              req.flash("msg_info", "Delete Guru Success");
              res.redirect("/guru");
            }
          }
        );
      });
    });
  }
);
router.get(
  "/edit/(:id_guru)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var query = connection.query(
        "SELECT * FROM guru where id_guru=" + req.params.id_guru,
        function (err, rows) {
          if (err) {
            var errornya = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/guru");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "Guru can't be find!");
              res.redirect("/guru");
            } else {
              console.log(rows);
              res.render("guru/edit", {
                title: "Edit ",
                data: rows[0],
                session_store: req.session,
              });
            }
          }
        }
      );
    });
  }
);
router.put(
"/edit/(:id_guru)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.assert("nama", "Please fill the name").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
      v_id_guru = req.sanitize("id_guru").escape().trim();
      v_nama = req.sanitize("nama").escape().trim();
      v_agama = req.sanitize("agama").escape().trim();
      v_jeniskelamin = req.sanitize("jeniskelamin").escape();
      v_jabatan = req.sanitize("jabatan").escape();
      v_ijazah = req.sanitize("ijazah").escape();

      if (!req.files) {
        var guru = {
          id_guru: v_id_guru,
          nama: v_nama,
          agama: v_agama,
          jeniskelamin: v_jeniskelamin,
          jabatan: v_jabatan,
          ijazah: v_ijazah,
          };
      }else{
        var file = req.files.gambar;
        file.mimetype == "image/jpeg";
        file.mv("public/images/upload/" + file.name);

      var guru = {
        id_guru: v_id_guru,
        nama: v_nama,
        agama: v_agama,
        jeniskelamin: v_jeniskelamin,
        jabatan: v_jabatan,
        ijazah: v_ijazah,
        gambar: file.name,
      }
    };
var update_sql = "update guru SET ? where id_guru = " + req.params.id_guru;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          guru,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("guru/edit", {
                id_guru: req.param("id_guru"),
                nama: req.param("nama"),
                agama: req.param("agama"),
                jeniskelamin: req.param("jeniskelamin"),
                jabatan: req.param("jabatan"),
                ijazah: req.param("ijazah"),
              });
            } else {
              req.flash("msg_info", "Update Guru success");
              res.redirect("/guru");
            }
          }
        );
      });
    } else {
      console.log(errors);
      errors_detail = "<p>Sory there are error</p><ul>";
      for (i in errors) {
        error = errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";
      req.flash("msg_error", errors_detail);
      res.redirect("/guru/edit/" + req.params.id_guru);
    }
  }
);

router.post("/add", authentication_mdl.is_login, function (req, res, next) {
req.assert("nama", "Please fill the name").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
      v_id_guru = req.sanitize("id_guru").escape().trim();
      v_nama = req.sanitize("nama").escape().trim();
      v_agama = req.sanitize("agama").escape();
      v_jeniskelamin = req.sanitize("jeniskelamin").escape();
      v_jabatan = req.sanitize("jabatan").escape();
      v_ijazah = req.sanitize("ijazah").escape();
        
    var file = req.files.gambar;
        file.mimetype == "image/jpeg";
        file.mv("public/images/upload/" + file.name);

    var guru = {
       	id_guru: v_id_guru,
        nama: v_nama,
        agama: v_agama,
        jeniskelamin: v_jeniskelamin,
        jabatan: v_jabatan,
        ijazah: v_ijazah,
     	gambar: file.name,
    };

var insert_sql = "INSERT INTO guru SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        guru,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("guru/add-guru", {
              id_guru: req.param("id_guru"),
              nama: req.param("nama"),
              agama: req.param("agama"),
              jeniskelamin: req.param("jeniskelamin"),
              jabatan: req.param("jabatan"),
              ijazah: req.param("ijazah"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Create guru success");
            res.redirect("/guru");
          }
        }
      );
    });
  } else {
    console.log(errors);
    errors_detail = "<p>Sory there are error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.render("guru/add-guru", {
      nama: req.param("nama"),
      agama: req.param("agama"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("guru/add-guru", {
    title: "Add New Guru",
    id_guru: "",
    nama: "",
    agama: "",
    jeniskelamin: "",
    jabatan: "",
    ijazah: "",
    session_store: req.session,
  });
});

module.exports = router;
