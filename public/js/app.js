const NOS_GRAFO = {
    'se_olinda': { nome: "Igreja da Sé (Olinda)", lat: -8.0142, lng: -34.8491 },
    'ti_peixinhos': { nome: "TI Peixinhos", lat: -8.0265, lng: -34.8651 },
    'ti_central': { nome: "TI Central (Recife)", lat: -8.0664, lng: -34.8812 },
    'est_recife': { nome: "Estação Recife (Metrô)", lat: -8.0672, lng: -34.8815 },
    'est_joana': { nome: "Estação Joana Bezerra", lat: -8.0722, lng: -34.8942 },
    'ti_aeroporto': { nome: "TI Aeroporto", lat: -8.1281, lng: -34.9135 },
    'est_piedade': { nome: "Estação Metrô Piedade", lat: -8.1678, lng: -34.9251 },
    'piedade_jaboatao': { nome: "Igrejinha de Piedade", lat: -8.1691, lng: -34.9161 }
};

const perfis = {
    eco: { distancia: 0.1, tempo: 0.2, custo: 1.5, co2: 3.0 },
    bike: { distancia: 1.0, tempo: 1.5, custo: 0.0, co2: 3.0 },
    economica: { distancia: 0.3, tempo: 0.5, custo: 3.0, co2: 0.5 },
    rapida: { distancia: 0.5, tempo: 3.0, custo: 0.5, co2: 0.2 },
    personalizada: null
};

let map;
let markers = [];
let currentPolyline = null;

// Lógica Modo Claro/Escuro
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'light';
htmlEl.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'light' ? '☀️' : '🌙';
});

// Busca a chave no backend e depois injeta o mapa na tela de forma segura (GitHub safe)
async function loadGoogleMapsScript() {
    try {
        const response = await fetch('/api/maps-key');
        const data = await response.json();
        
        if (!data.key || data.key === 'SUA_CHAVE_AQUI') {
            console.error("Chave da API do Google Maps não configurada no .env");
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.key}&libraries=places,geometry&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        window.initMap = function() {
            if(typeof google !== 'undefined') {
                map = new google.maps.Map(document.getElementById("map"), {
                    zoom: 12,
                    center: { lat: -8.0900, lng: -34.8850 },
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
                atualizarPontosGrafo();
            }
        };
    } catch (error) {
        console.error("Erro ao carregar a API do mapa:", error);
    }
}
loadGoogleMapsScript();

// Listeners
document.getElementById('origem').addEventListener('change', atualizarPontosGrafo);
document.getElementById('destino').addEventListener('change', atualizarPontosGrafo);

document.querySelectorAll('input[name="perfil"]').forEach(radio => {
    radio.addEventListener('change', (e) => atualizarPerfil(e.target.value));
});

['distancia', 'tempo', 'custo', 'co2'].forEach(key => {
    document.getElementById(`prioridade-${key}`).addEventListener('input', (e) => {
        document.getElementById(`val-${key}`).innerText = parseFloat(e.target.value).toFixed(1);
    });
});

document.getElementById('btn-calcular').addEventListener('click', calcularRota);

function atualizarPerfil(tipo) {
    const config = perfis[tipo];
    const inputs = ['distancia', 'tempo', 'custo', 'co2'];
    
    if (config) {
        inputs.forEach(key => {
            const el = document.getElementById(`prioridade-${key}`);
            el.value = config[key];
            el.disabled = true;
            document.getElementById(`val-${key}`).innerText = config[key].toFixed(1);
        });
    } else {
        inputs.forEach(key => {
            document.getElementById(`prioridade-${key}`).disabled = false;
        });
    }
}

function atualizarPontosGrafo() {
    if(typeof google === 'undefined') return;
    const pOrigem = NOS_GRAFO[document.getElementById('origem').value];
    const pDestino = NOS_GRAFO[document.getElementById('destino').value];

    markers.forEach(m => m.setMap(null));
    markers = [];

    markers.push(new google.maps.Marker({
        position: { lat: pOrigem.lat, lng: pOrigem.lng }, map: map, title: pOrigem.nome
    }));
    markers.push(new google.maps.Marker({
        position: { lat: pDestino.lat, lng: pDestino.lng }, map: map, title: pDestino.nome
    }));

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(pOrigem.lat, pOrigem.lng));
    bounds.extend(new google.maps.LatLng(pDestino.lat, pDestino.lng));
    map.fitBounds(bounds);
}

async function calcularRota() {
    const idOrigem = document.getElementById('origem').value;
    const idDestino = document.getElementById('destino').value;

    if (idOrigem === idDestino) {
        alert('A Origem e o Destino devem ser diferentes.');
        return;
    }

    const pOrigem = NOS_GRAFO[idOrigem];
    const pDestino = NOS_GRAFO[idDestino];
    const perfilAtivo = document.querySelector('input[name="perfil"]:checked').value;
    
    let travelMode = 'TRANSIT';
    if (perfilAtivo === 'rapida') travelMode = 'DRIVE';
    if (perfilAtivo === 'bike') travelMode = 'BICYCLE';

    try {
        const response = await fetch('/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin: pOrigem, destination: pDestino, travelMode })
        });

        if(!response.ok) throw new Error("Erro na API Backend");
        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            alert(`A API não encontrou rotas para o modo ${travelMode}.`);
            return;
        }

        const route = data.routes[0];
        
        if(typeof google !== 'undefined') {
            const path = google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline);
            if (currentPolyline) currentPolyline.setMap(null); 
            
            const rootStyle = getComputedStyle(document.body);
            let corRota = '#2e7d32'; // Padrão
            if (perfilAtivo === 'rapida') corRota = rootStyle.getPropertyValue('--secondary-color').trim();
            if (perfilAtivo === 'bike') corRota = '#00838f';
            
            currentPolyline = new google.maps.Polyline({
                path: path, geodesic: true, strokeOpacity: 0.8, strokeWeight: 6, strokeColor: corRota
            });
            currentPolyline.setMap(map);
            const bounds = new google.maps.LatLngBounds();
            path.forEach(latLng => bounds.extend(latLng));
            map.fitBounds(bounds);
        }

        const distanciaKm = route.distanceMeters / 1000;
        const tempoMin = Math.round(parseInt(route.duration.replace('s', '')) / 60);

        let passos = [];
        route.legs[0].steps.forEach(step => {
            let classe = 'walk'; let icone = '🚶'; let titulo = 'Caminhada';
            let stepDist = step.distanceMeters ? `${step.distanceMeters} m` : '';
            let stepTime = step.duration ? `${Math.round(parseInt(step.duration.replace('s','')) / 60)} min` : '';
            let meta = `${stepDist} • ${stepTime}`;

            if (step.travelMode === 'TRANSIT') {
                const transit = step.transitDetails;
                const lineName = transit?.transitLine?.name || transit?.transitLine?.nameShort || 'Transporte Público';
                const vehicleType = transit?.transitLine?.vehicle?.type || '';
                const depStation = transit?.stopDetails?.departureStop?.name || '';
                const arrStation = transit?.stopDetails?.arrivalStop?.name || '';
                
                if (vehicleType === 'SUBWAY' || vehicleType === 'METRO') { classe = 'metro'; icone = '🚇'; } 
                else if (lineName.toLowerCase().includes('brt')) { classe = 'brt'; icone = '🚍'; } 
                else { classe = 'bus'; icone = '🚌'; }
                
                titulo = `Pegar linha: ${lineName}`;
                meta = `Embarque: <strong>${depStation}</strong> <br> Desembarque: <strong>${arrStation}</strong> <br> ${stepTime}`;
            } else if (step.travelMode === 'DRIVE') {
                classe = 'app'; icone = '🚗'; titulo = step.navigationInstruction?.instructions || 'Trajeto';
            } else if (step.travelMode === 'BICYCLE') {
                classe = 'bike'; icone = '🚲'; titulo = step.navigationInstruction?.instructions || 'Bicicleta';
            } else if (step.travelMode === 'WALK') {
                titulo = step.navigationInstruction?.instructions || 'Caminhada';
            }
            passos.push({ classe, icone, titulo, meta });
        });

        let custoR = 0; let co2Grama = 0;
        if (perfilAtivo === 'bike') { custoR = 0.00; co2Grama = 0; } 
        else if (perfilAtivo === 'eco' || perfilAtivo === 'economica') { custoR = 4.10; co2Grama = 0; } 
        else if (perfilAtivo === 'rapida') { custoR = 5.00 + (distanciaKm * 1.80); co2Grama = Math.round(distanciaKm * 120); } 
        else {
            const pCo2 = parseFloat(document.getElementById('prioridade-co2').value);
            const pCusto = parseFloat(document.getElementById('prioridade-custo').value);
            custoR = 4.10 + (pCusto * 1.5);
            co2Grama = (pCo2 >= 1.5) ? 0 : Math.round(distanciaKm * (40 / Math.max(0.1, pCo2)));
        }

        const emissaoCarroPadrao = Math.round(distanciaKm * 120);
        const evitado = Math.max(0, emissaoCarroPadrao - co2Grama);

        document.getElementById('res-tempo').innerText = `${tempoMin} min`;
        document.getElementById('res-custo').innerText = `R$ ${custoR.toFixed(2).replace('.', ',')}`;
        document.getElementById('res-distancia').innerText = `${distanciaKm.toFixed(1).replace('.', ',')} km`;
        document.getElementById('res-co2').innerText = `${co2Grama} g`;
        document.getElementById('res-impacto').innerText = `${evitado} g`;

        const containerItinerario = document.getElementById('itinerario-conteudo');
        containerItinerario.innerHTML = passos.map(p => `
            <div class="itinerary-step">
                <div class="step-icon ${p.classe}">${p.icone}</div>
                <div class="step-details">
                    <div class="step-title">${p.titulo}</div>
                    <div class="step-meta">${p.meta}</div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao processar rota no backend. O servidor está rodando?");
    }
}
