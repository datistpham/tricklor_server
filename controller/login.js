import md5 from "md5"
import { dbconnection } from "../db/init.js"

const login= (req, res, next)=> {
    dbconnection.collection("user").find({account: req.body.account, password: md5(req.body.password)}).toArray(function(err, result) {
        if(err) throw err
        if(result.length > 0) {
            if(result[0]?.oauth2=== true) {
                return res.status(200).json({message: "Vui lòng quét mã qr đăng nhập của bạn", login: "verify", uid: result[0].id_user, twoFa: result[0].twoFa})
            }
            else {
                return res.status(200).json({message: "Đăng nhập thành công", login: true, uid: result[0].id_user, sid: result[0].id_key})
            }
        }
        else {
            return res.status(200).json({message: "Đăng nhập thất bại, tài khoản hoặc mật khẩu không chính xác.", login: false})
        }
    })
}

export default login