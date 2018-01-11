'use latest';
import express from 'express';
import { fromExpress } from 'webtask-tools';
import bodyParser from 'body-parser';
import requireFromString from 'require-from-string';


  var app = register();
  fromExpress(app);


