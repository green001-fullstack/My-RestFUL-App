const http = require("http")
const fs = require("fs/promises")

class Butter{
    constructor(){
        // this in this.server refers to the instance
        // of the HTTP server created by
        // http.createServer().
        // The this keyword here points to the current
        // instance of the Butter class. As such I
        // don't need to write server = http.createServer() again in the
        // server.js, it is already handled in the constructor 
        this.server = http.createServer();

        this.routes = {}
        this.middleware = []

        this.server.on("request", (req, res)=>{
            res.sendFile = async(path, mime)=>{
                const fileHandle = await fs.open(path, "r")
                const fileStream = fileHandle.createReadStream()

                res.setHeader("Content-Type", mime)

                fileStream.pipe(res)
            }

            res.status = (code)=>{
                res.statusCode = code
                return res;
            }

            res.json = (data) =>{
                res.setHeader("Content-Type", "application/json")
                res.end(JSON.stringify(data))
            }

            // this.middleware[0](req, res, ()=>{
            //     this.middleware[1](req,res, ()=>{
            //         this.middleware[2](req, res, ()=>{
            //             this.routes[req.method.toLowerCase() + req.url](req, res)
            //         })
            //     })
            // })

            const runMiddleWare = (req, res, middleware, index)=>{
            if(index === middleware.length){
                if(!this.routes[req.method.toLowerCase() + req.url]){
                    return res.status(404).json({error: `Cannot ${req.method} ${req.url}`})
                }
                this.routes[req.method.toLowerCase() + req.url](req, res)
            }else {
                middleware[index](req, res, ()=>{
                    runMiddleWare(req, res, middleware, index + 1)
                })
            }
        }
        runMiddleWare(req, res, this.middleware, 0)
        })
    }

    route(method, path, cb){
        this.routes[method + path] = cb;
    }

    beforeEach(cb){
        this.middleware.push(cb);
    }

    listen = (port, cb) =>{
        this.server.listen(port, ()=>{
            cb()
        })
    }
}

module.exports = Butter;