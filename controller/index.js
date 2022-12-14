import md5 from "md5"
import { dbconnection } from "../db/init.js"

const index= (req, res)=> {
    if(!req.body.uid || !req.body.sid) {
        return res.status(200).json({message: "Chưa xác thực", login: false})
    }
    else {
        dbconnection.collection("lang").find({id_user: req.body.uid}).toArray(function(err1, result1) {
            if(err1) throw err1
            else {
                if(result1.length> 0 ) {
                    dbconnection.collection("user").find({id_user: req.body.uid, id_secret: md5(req.body.sid)}).toArray(function(err, result) {
                        if(err) throw err
                        if(result.length > 0) {
                            return res.status(200).json({data: {account: result[0].account, email: result[0].email, uid: result[0].id_user, balance: result[0].balance, promotion: result[0].promotion, api_key: result[0].api_key, login: true, oauth2: result[0].oauth2 || false,}, login: true, oauth2: result[0].oauth2 || false, lang: result1[0].lang})
                        }
                        else {
                            return res.status(200).json({login: false, message: "Chưa xác thực"})
                        }
                    })
                }
                else {
                    dbconnection.collection("user").find({id_user: req.body.uid, id_secret: md5(req.body.sid)}).toArray(function(err, result) {
                        if(err) throw err
                        if(result.length > 0) {
                            return res.status(200).json({data: {account: result[0].account, email: result[0].email, uid: result[0].id_user, balance: result[0].balance, promotion: result[0].promotion, api_key: result[0].api_key, login: true, oauth2: result[0].oauth2 || false,}, login: true, oauth2: result[0].oauth2 || false, lang: "vn"})
                        }
                        else {
                            return res.status(200).json({login: false, message: "Chưa xác thực"})
                        }
                    })
                }
            }
        })
    }
}

export default index