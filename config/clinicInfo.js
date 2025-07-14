const services = [
    {
        name: 'Consultație generală',
        price: 100,
        description: 'Examinare completă și plan de tratament'
    },
    {
        name: 'Detartraj cu ultrasunete',
        price: 200,
        description: 'Curățare profesională și îndepărtare tartru'
    },
    {
        name: 'Plombă simplă',
        price: 250,
        description: 'Tratament carie superficială'
    },
    {
        name: 'Plombă complexă',
        price: 400,
        description: 'Tratament carie profundă'
    },
    {
        name: 'Extracție simplă',
        price: 300,
        description: 'Extracție dinte cu rădăcină simplă'
    },
    {
        name: 'Control periodic',
        price: 50,
        description: 'Verificare stare generală (pentru pacienți existenți)'
    }
];

const schedule = {
    monday: { start: '08:00', end: '16:00', slots: [] },
    tuesday: { start: '08:00', end: '16:00', slots: [] },
    wednesday: { start: '08:00', end: '16:00', slots: [] },
    thursday: { start: '08:00', end: '16:00', slots: [] },
    friday: { start: '08:00', end: '16:00', slots: [] },
    saturday: { closed: true },
    sunday: { closed: true }
};

function getServicesText() {
    return services.map(s => 
        `- ${s.name}: ${s.price} RON (${s.description})`
    ).join('\n');
}

function getServiceByName(name) {
    return services.find(s => 
        s.name.toLowerCase().includes(name.toLowerCase())
    );
}

module.exports = {
    services,
    schedule,
    getServicesText,
    getServiceByName
};