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
/* GET Pegawai page. */

router.get("/", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM pegawai",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("pegawai/listpegawai", {
          data: rows,
          session_store: req.session,
        });
      }
    );
  });
});

router.delete(
    "/delete/(:id_pegawai)",
    authentication_mdl.is_login,
    function (req, res, next) {
      req.getConnection(function (err, connection) {
        var pegawai = {
          id_pegawai: req.params.id_pegawai,
        };
  
        var delete_sql = "delete from pegawai where ?";
        req.getConnection(function (err, connection) {
          var query = connection.query(
            delete_sql,
            pegawai,
            function (err, result) {
              if (err) {
                var errors_detail = ("Error Delete : %s ", err);
                req.flash("msg_error", errors_detail);
                res.redirect("/pegawai");
              } else {
                req.flash("msg_info", "Delete Pegawai Success");
                res.redirect("/pegawai");
              }
            }
          );
        });
      });
    }
  );

  router.get(
    "/edit/(:id_pegawai)",
    authentication_mdl.is_login,
    function (req, res, next) {
      req.getConnection(function (err, connection) {
        var query = connection.query(
          "SELECT * FROM pegawai where id_pegawai=" + req.params.id_pegawai,
          function (err, rows) {
            if (err) {
              var errornya = ("Error Selecting : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/pegawai");
            } else {
              if (rows.length <= 0) {
                req.flash("msg_error", "Pegawai can't be find!");
                res.redirect("/pegawai");
              } else {
                console.log(rows);
                res.render("pegawai/edit", {
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
    "/edit/(:id_pegawai)",
    authentication_mdl.is_login,
    function (req, res, next) {
      req.assert("nama_pegawai", "Please fill the name").notEmpty();
      var errors = req.validationErrors();
      if (!errors) {
        v_id_pegawai = req.sanitize("id_pegawai").escape().trim();
        v_nama_pegawai = req.sanitize("nama_pegawai").escape().trim();
        v_agama = req.sanitize("agama").escape().trim();;
        v_jenis_kelamin = req.sanitize("jenis_kelamin").escape();
        v_jabatan = req.sanitize("jabatan").escape();
  
        if (!req.files) {
        var pegawai = {
          id_pegawai: v_id_pegawai,
          nama_pegawai: v_nama_pegawai,
          agama: v_agama,
          jenis_kelamin: v_jenis_kelamin,
          jabatan: v_jabatan,
        };
        }else{
          var file = req.files.gambar;
          file.mimetype == "image/jpeg";
          file.mv("public/images/upload/" + file.name);

        var pegawai = {
          id_pegawai: v_id_pegawai,
          nama_pegawai: v_nama_pegawai,
          agama: v_agama,
          jenis_kelamin: v_jenis_kelamin,
          jabatan: v_jabatan,
          gambar: file.name,
        }
      };

        var update_sql = "update pegawai SET ? where id_pegawai = " + req.params.id_pegawai;
        req.getConnection(function (err, connection) {
          var query = connection.query(
            update_sql,
            pegawai,
            function (err, result) {
              if (err) {
                var errors_detail = ("Error Update : %s ", err);
                req.flash("msg_error", errors_detail);
                res.render("pegawai/edit", {
                  id_pegawai: req.param("id_pegawai"),
                  nama_pegawai: req.param("nama_pegawai"),
                  agama: req.param("agama"),
                  jenis_kelamin: req.param("jenis_kelamin"),
                  jabatan: req.param("jabatan"),
                  
                });
              } else {
                req.flash("msg_info", "Update Pegawai success");
                res.redirect("/pegawai");
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
        res.redirect("/pegawai/edit/" + req.params.id_pegawai);
      }
    }
  );
  
  router.post("/add", authentication_mdl.is_login, function (req, res, next) {
    req.assert("nama_pegawai", "Please fill the name").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
        v_id_pegawai = req.sanitize("id_pegawai").escape().trim();
        v_nama_pegawai = req.sanitize("nama_pegawai").escape().trim();
        v_agama = req.sanitize("agama").escape().trim();;
        v_jenis_kelamin = req.sanitize("jenis_kelamin").escape();
        v_jabatan = req.sanitize("jabatan").escape();

        var file = req.files.gambar;
        file.mimetype == "image/jpeg";
        file.mv("public/images/upload/" + file.name);
  
        var pegawai = {
          id_pegawai: v_id_pegawai,
          nama_pegawai: v_nama_pegawai,
          agama: v_agama,
          jenis_kelamin: v_jenis_kelamin,
          jabatan: v_jabatan,
          gambar: file.name,
        };
  
      var insert_sql = "INSERT INTO pegawai SET ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          insert_sql,
          pegawai,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Insert : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("pegawai/add-pegawai", {
                id_pegawai: req.param("id_pegawai"),
                nama_pegawai: req.param("nama_pegawai"),
                agama: req.param("agama"),
                jenis_kelamin: req.param("jenis_kelamin"),
                jabatan: req.param("jabatan"),
                session_store: req.session,
              });
            } else {
              req.flash("msg_info", "Create Pegawai success");
              res.redirect("/pegawai");
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
      res.render("pegawai/add-pegawai", {
        nama_pegawai: req.param("nama_pegawai"),
        jabatan:req.param("jabatan"),
        session_store: req.session,
      });
    }
  });
  
  router.get("/add", authentication_mdl.is_login, function (req, res, next) {
    res.render("pegawai/add-pegawai", {
      title: "Add New Pegawai",
      id_pegawai: "",
      nama_pegawai: "",
      agama: "",
      jenis_kelamin: "",
      jabatan: "",
      
      session_store: req.session,
    });
  });

module.exports = router;
