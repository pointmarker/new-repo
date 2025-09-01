const { source_path } = require("../environment/environment")

exports.serveHTML = (page) => {
    return(req,res) => {
        res.status(200).sendFile(source_path+"app/public/pages/"+page+".html")
    }
}

