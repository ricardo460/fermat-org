{
    processes: [
        process: {
            name: 'Nombre que describe al flujo',
            description: '',
            steps: [{
                type: 'start'
                title: 'Inicio',
                description: 'Paso inicial del flujo',
                section: 'name of section',
                layer: 'name of layer',
                component: 'name of component',
                next: [1] // Una lista de indices del mismo array
            }, {
                type: 'preparation'
                title: 'Cargar datos',
                description: 'Cargar datos de base de datos o servidor',
                section: 'name of section',
                layer: 'name of layer',
                component: 'name of component',
                next: [2]
            }, {
                type: 'activity'
                title: 'Procesamiento de datos',
                description: 'Se procesan los datos obtenidos y se relizan un calculo',
                section: 'name of section',
                layer: 'name of layer',
                component: 'name of component',
                next: [3]
            }, {
                type: 'activity'
                title: 'Procesamiento de datos',
                description: 'Se procesan los datos obtenidos y se relizan un calculo',
                section: 'name of section',
                layer: 'name of layer',
                component: 'name of component',
                next: [4]
            } {
                type: 'decision'
                title: 'Condicional',
                description: 'Dependiendo del resultado se toma un camino',
                section: 'name of section',
                layer: 'name of layer',
                component: 'name of component',
                next: [5, 6]
            }, {
                type: 'loop'
                title: 'Volver al inicio',
                description: 'Paso inicial del flujo',
                section: 'name of section',
                layer: 'name of layer',
                component: 'name of component',
                next: [0]
            }, {
                type: 'end'
                title: 'Fin del proceso',
                description: 'Paso final del flujo',
                section: 'name of section',
                layer: 'name of layer',
                component: 'name of component',
                next: []
            }]
        }
    ]
};