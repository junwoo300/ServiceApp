const Product = require('../Models/Product')


exports.read = async (req, res) => {

    //ค้นหาด้วย ID เมดตอด GET

    try {

        const id = req.params.id

        const producted = await Product.find({ _id: id }).exec();

        res.send(producted)

    } catch (err) {

        console.log(err)
        res.status(500).send('server error')
    }

}

exports.list = async (req, res) => {

    // ดึงข้อมูลทั้งหมดโชว์ GET

    try {

        const producted = await Product.find({}).exec();

        res.send(producted)

    } catch (err) {

        console.log(err)
        res.status(500).send('server error')
    }
}

exports.create = async (req, res) => {

    // สร้างข้อมูลลง DATABASE Post

    try {
        console.log(req.body)
        const producted = await Product(req.body).save()


        res.send(producted)

    } catch (err) {

        console.log(err)
        res.status(500).send('server error')
    }
}


exports.update = async (req, res) => {

    // update ข้อมูล database put
    try {

        const id = req.params.id
        const updated = await Product.findOneAndUpdate({ _id: id }, req.body, { new: true }).exec()

        res.send(updated)

    } catch (err) {

        console.log(err)
        res.status(500).send('server error')
    }
}


exports.remove = async (req, res) => {

    try {

        const id = req.params.id
        const removed = await Product.findOneAndDelete({ _id: id}).exec()

        res.send(removed)

    } catch (err) {

        console.log(err)
        res.status(500).send('server error')
    }
}


// New method to search by name
exports.searchByName = async (req, res) => {
    // ค้นหาข้อมูลด้วยชื่อ เมดตอด GET
    try {
        const name = req.query.name;
        const products = await Product.find({ name: { $regex: name, $options: 'i' } }).exec();
        res.send(products);
    } catch (err) {
        console.log(err);
        res.status(500).send('server error');
    }
}

