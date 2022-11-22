var express = require('express');
var router = express.Router();
const stock_read_log = require('../models/stock_read_log');
const FileSystem = require("fs");
const { ifError } = require('assert');

router.use('/export-data', async (req, res) => {
  const list = await stock_read_log.aggregate([
    {
      $match: {}
    }
  ]).exec();
  
  FileSystem.writeFile('./stock_read_log.json', JSON.stringify(list), (error) => {
      if (error) throw error;
  });

  console.log('stock_read_log.json exported!');
  res.json({statusCode: 1, message: 'stock_read_log.json exported!'})
});

router.use('/import-data', async (req, res) => {
  const list = await stock_read_log.aggregate([
    {
      $match: {}
    }
  ]).exec();
  
  FileSystem.readFile('./stock_read_log.json', async (error, data) => {
      if (error) throw error;

      const list = JSON.parse(data);

      const deletedAll = await stock_read_log.deleteMany({});

      const insertedAll = await stock_read_log.insertMany(list);

      console.log('stock_read_log.json imported!');
  res.json({statusCode: 1, message: 'stock_read_log.json imported!'})
  });

  
})

router.use('/edit-repacking-data', async (req, res) => {
  
  const companyId = req.body.company_id;
  const reqPayload = req.body.payload;
  const reject_qr_list = req.body.reject_qr_list;
  const new_qr_list = req.body.new_qr_list;
  var next_payload_counter = reqPayload.slice(-1)

  for(var i = 0; i < reject_qr_list.length; i++){
    var counter = next_payload_counter++;
    counter++;
    var new_payload = reqPayload.slice(0,-1)+counter;
    await stock_read_log.updateOne(
      {company_id: companyId,payload:new_payload, "qr_list.payload": new_qr_list[i].payload},
      {$set:{"qr_list.$.payload": reject_qr_list[i].payload}}
    );
  }

  for(var j = 0 ; j < new_qr_list.length; j++){
    await stock_read_log.updateOne(
      {company_id: companyId, payload: reqPayload, "qr_list.payload": reject_qr_list[j].payload},
      {$set:{"qr_list.$.payload": new_qr_list[j].payload}}
    )
  }
  
  res.json({statusCode:1, message:"Successfully updated repacking data!"});

})

router.use('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
