import express, { json } from 'express'
import cors from 'cors'
import fs from 'fs'

const app = express()
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))
app.use(express.json())

const PORT = 3333
const dateBase = './motoristas.json'

const lerMotoristas = (callback) => {
    fs.readFile(dateBase, 'utf-8', (err, dados) => {
        if (err) {
            if (err.code === 'ENOENT') {
                fs.writeFile(dateBase, '[]', () => callback([]))
            } else {
                return callback([]);
            }
        } else {
            callback(JSON.parse(dados || '[]'))
        }
    })
}

const salvarMotoristas = (dados, callback) => {
    fs.writeFile(dateBase, JSON.stringify(dados, null, 2), callback)
}

app.get('/motoristas', (req, res) => {
    lerMotoristas((motoristas) => {
        res.json(motoristas)
    })
})

app.post('/motoristas', (req, res) => {
    const { nome, dataNascimento, carteiraHabilitacao } = req.body

    lerMotoristas((motoristas) => {
        const novoMotorista = {
            id: Date.now(),
            nome,
            dataNascimento,
            carteiraHabilitacao
        }
        // if (novoMotorista.dataNascimento < 18) {
        //     return res.status(400).json({ mensagem: "Digite uma idade válida! Cadastro é feito apenas para maiores de 16 anos." })
        // }
        motoristas.push(novoMotorista)
        salvarMotoristas(motoristas, (err) => {
            if (err) {
                res.status(500).json({ mensagem: 'Erro ao salvar o motorista!' })
            }
            res.status(200).json(novoMotorista)
        })
    })  
})



app.get('/motoristas/:id', (req, res) => {
    const id = Number(req.params.id);

    lerMotoristas((motoristas) => {
        const motorista = motoristas.find(p => p.id === id);

        if (!motorista) {
            return res.status(400).json({ mensagem: "motorista não encontrada" });
        }

        res.status(200).json(motorista);
    })
})

app.put('/motoristas/:id', (req, res) => {
    const id = Number(req.params.id);
    const { nome, email, senha, idade, cidade } = req.body;

    lerMotoristas((motoristas) => {
        const index = motoristas.findIndex(p => p.id === id);

        if (index === -1) {
            return res.status(404).json({ mensagem: 'Participante não encontrado!' });
        }
        const camposAtualizaveis = { nome, email, senha, idade, cidade }
        for (const campo in camposAtualizaveis) {
            if (camposAtualizaveis[campo] !== undefined) {
                motoristas[index][campo] = camposAtualizaveis[campo];
            }
        }

        salvarMotoristas(motoristas, (err) => {
            if (err) {
                return res.status(500).json({ mensagem: 'Erro ao salvar alterações!' });
            }

            res.status(200).json({ mensagem: 'Participante atualizado com sucesso!', participante: motoristas[index] });
        });
    });
});
app.delete('/motoristas/:id', (req, res) => {
    const id = Number(req.params.id);

    lerMotoristas((motoristas) => {
        const index = motoristas.findIndex(p => p.id === id);

        if (index === -1) {
            return res.status(400).json({ mensagem: 'Pessoa não encontrada!' });
        }

        motoristas.splice(index, 1);

        salvarMotoristas(motoristas, (err) => {
            if (err) {
                return res.status(500).json({ mensagem: 'Erro ao salvar alterações' });
            }

            res.status(200).json({ mensagem: 'Pessoa excluída com sucesso!' });
        })
    })
})


app.listen(PORT, () => {
    console.log('Servidor iniciado com sucesso, na porta: 3333')
})
