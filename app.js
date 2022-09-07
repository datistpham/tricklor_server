import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectMongo from "./db/init.js"
import signup from "./controller/signup.js"
import login from "./controller/login.js"
import index from "./controller/index.js"
import change_password from "./controller/change_password.js"
import get_option from "./controller/get_option.js"
import update_admin_option from "./controller/update_admin_option.js"
import recharge_manual from "./controller/recharge_manual.js"
import add_service_hotmail from "./controller/add_service_hotmail.js"
import add_service_gmail from "./controller/add_service_gmail.js"
import get_service_hotmail from "./controller/get_service_hotmail.js"
import get_service_gmail from "./controller/get_service_gmail.js"
import upload_file_hotmail from "./controller/upload_file_hotmail.js"
import upload_file_gmail from "./controller/upload_file_gmail.js"
import buy_account from "./controller/buy_account.js"
import { Server } from "socket.io"
import { createServer } from "http"
import get_receipt from "./controller/get_receipt.js"
import buy_account_gmail from "./controller/buy_account_gmail.js"
import dateFormat from "dateformat"
import querystring from "qs"
import crypto from "crypto"
import get_user from "./controller/get_user.js"
import delete_service_gmail from "./controller/delete_service_gmail.js"
import delete_service_hotmail from "./controller/delete_service_hotmail.js"
import check_payment from "./controller/check_payment.js"
// import multer from "multer"
// const upload= multer()

dotenv.config()

const app= express()
const httpServer= createServer(app)
const io= new Server(httpServer)
app.use(cors())
app.use(express.json())
// app.use(upload.array())
app.use(express.urlencoded({
    extended: true
}))

app.post("/signup", signup)
app.post("/login", login)
app.post("/change_password", change_password)
app.post("/get_option/main", get_option)
app.post("/update/admin_option", update_admin_option)
app.post("/recharge/manual", recharge_manual)
app.post("/", index)
app.post("/edit/add/hotmail", add_service_hotmail)
app.post("/edit/add/gmail", add_service_gmail)
app.get("/edit/get/hotmail", get_service_hotmail)
app.get("/edit/get/gmail", get_service_gmail)
app.post("/upload_file/hotmail", upload_file_hotmail)
app.post("/upload_file/gmail", upload_file_gmail)
app.post("/buy/account", buy_account)
app.post("/buy/account/gmail", buy_account_gmail)
app.get("/history", get_receipt)
app.get("/get_user", get_user)
app.post("/edit/delete/gmail", delete_service_gmail)
app.post("/edit/delete/hotmail", delete_service_hotmail)
app.post("/check/payment", check_payment)

app.post('/create_payment_url', function (req, res, next) {
    var ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var tmnCode = "9FZVLYLC";
    var secretKey = "MEJRIRHWXZLNKQAIOPZLVNNPMEVTFHQX";
    var vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    var returnUrl = "http://localhost:3000/VnPayReturn";
    var date = new Date();

    var createDate = dateFormat(date, 'yyyymmddHHmmss');
    var orderId = dateFormat(date, 'HHmmss');
    var amount = req.body.amount;
    var bankCode = req.body.bankCode;
    
    var orderInfo = req.body.orderDescription;
    var orderType = req.body.orderType;
    var locale = req.body.language;
    if(locale === null || locale === ''){
        locale = 'vn';
    }
    var currCode = 'VND';
    var vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if(bankCode !== null && bankCode !== ''){
        vnp_Params['vnp_BankCode'] = bankCode;
    }
    vnp_Params = sortObject(vnp_Params);
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    res.status(200).json({url: vnpUrl})
});
function sortObject(obj) {
	var sorted = {};
	var str = [];
	var key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
io.on("connection", (socket)=> {
    console.log(socket.id)
})

connectMongo()

httpServer.listen(process.env.PORT || 4000, ()=> console.log("Server run port 4000"))