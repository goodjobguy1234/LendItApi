const customResponse = (req, res, next) => {

    /**
     * (default status 200)
     * Success response
     */
    res.success = function ({result={}, code=200, message=""}) {
        return res.json({
            result,
            code,
            message
        })
    }

    /**
     * Custom error response
     */
    res.error = function({errors={}, code=400, message="", result={}}) {
        return res.json({
            errors,
            code,
            message,
            result
        })
    }

    /**
     * (status 403)
     * Bad request response
     */
    res.badreq = function({errors={}, code=400, message="", result={}}) {
        return res.status(400).error({ errors, code, message, result })
    }

    res.accdenial = function({errors={}, code=401, message="Access Denied", result={}}) {
        return res.status(400).error({ errors, code, message, result })
    }


    /**
     * (status 403)
     * Forbidden request response
     */
    res.forbidden = function({errors={}, code=403, message="", result={}}) {
        return res.status(403).error({ errors, code, message, result })
    }

    res.notfound = function({errors={}, code=404, message="", result={}}) {
        return res.status(404).error({ errors, code, message, result })
    }
    
    /**
     * (status 401)
     * Unauthorize request response
     */
    res.unauth = function({errors={}, code=401, message="", result={}}) {
        return res.status(403).error({ errors, code, message, result })
    }

    /**
     * (status 500)
     * Internal request response
     */
    res.internal = function({errors={}, code=500, message="", result={}}) {
        return res.status(500).error({ errors, code, message, result })
    }

    next();
}


module.exports = customResponse;