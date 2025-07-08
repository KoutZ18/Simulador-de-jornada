const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        
        let dadosSimulacao = [];
        let ajustesManual = {};
        let diaAtualAjuste = null;
        let graficoTendencia = null;
        let feriadosPersonalizados = [];

        // Manipulação da logo
        function handleLogoUpload(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const logoImage = document.getElementById('logoImage');
                    const logoPlaceholder = document.getElementById('logoPlaceholder');
                    
                    logoImage.src = e.target.result;
                    logoImage.style.display = 'block';
                    logoPlaceholder.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        }

        // Toggle para turno noturno
        function toggleTurnoNoturno() {
            const turnoNoturno = document.getElementById('turnoNoturno').checked;
            if (turnoNoturno) {
                document.getElementById('entradaSeg').value = '22:00';
                document.getElementById('saidaSeg').value = '06:00';
                document.getElementById('entradaSab').value = '22:00';
                document.getElementById('saidaSab').value = '04:00';
            } else {
                document.getElementById('entradaSeg').value = '08:00';
                document.getElementById('saidaSeg').value = '17:00';
                document.getElementById('entradaSab').value = '08:00';
                document.getElementById('saidaSab').value = '12:00';
            }
        }

        // Feriados nacionais brasileiros
        function getFeriadosNacionais(ano) {
            const feriados = [
                { data: `${ano}-01-01`, nome: 'Confraternização Universal' },
                { data: `${ano}-04-21`, nome: 'Tiradentes' },
                { data: `${ano}-05-01`, nome: 'Dia do Trabalho' },
                { data: `${ano}-09-07`, nome: 'Independência do Brasil' },
                { data: `${ano}-10-12`, nome: 'Nossa Senhora Aparecida' },
                { data: `${ano}-11-02`, nome: 'Finados' },
                { data: `${ano}-11-15`, nome: 'Proclamação da República' },
                { data: `${ano}-12-25`, nome: 'Natal' }
            ];
            
            // Adicionar Carnaval e Sexta-feira Santa (datas móveis)
            const carnaval = getCarnaval(ano);
            const sextaSanta = getSextaSanta(ano);
            const corpusChristi = getCorpusChristi(ano);
            
            if (carnaval) feriados.push({ data: carnaval, nome: 'Carnaval' });
            if (sextaSanta) feriados.push({ data: sextaSanta, nome: 'Sexta-feira Santa' });
            if (corpusChristi) feriados.push({ data: corpusChristi, nome: 'Corpus Christi' });
            
            return feriados;
        }

        // Calcular Carnaval (47 dias antes da Páscoa)
        function getCarnaval(ano) {
            const pascoa = getPascoa(ano);
            const carnaval = new Date(pascoa);
            carnaval.setDate(carnaval.getDate() - 47);
            return carnaval.toISOString().split('T')[0];
        }

        // Calcular Sexta-feira Santa (2 dias antes da Páscoa)
        function getSextaSanta(ano) {
            const pascoa = getPascoa(ano);
            const sextaSanta = new Date(pascoa);
            sextaSanta.setDate(sextaSanta.getDate() - 2);
            return sextaSanta.toISOString().split('T')[0];
        }

        // Calcular Corpus Christi (60 dias após a Páscoa)
        function getCorpusChristi(ano) {
            const pascoa = getPascoa(ano);
            const corpusChristi = new Date(pascoa);
            corpusChristi.setDate(corpusChristi.getDate() + 60);
            return corpusChristi.toISOString().split('T')[0];
        }

        // Algoritmo para calcular a Páscoa
        function getPascoa(ano) {
            const a = ano % 19;
            const b = Math.floor(ano / 100);
            const c = ano % 100;
            const d = Math.floor(b / 4);
            const e = b % 4;
            const f = Math.floor((b + 8) / 25);
            const g = Math.floor((b - f + 1) / 3);
            const h = (19 * a + b - d - g + 15) % 30;
            const i = Math.floor(c / 4);
            const k = c % 4;
            const l = (32 + 2 * e + 2 * i - h - k) % 7;
            const m = Math.floor((a + 11 * h + 22 * l) / 451);
            const mes = Math.floor((h + l - 7 * m + 114) / 31) - 1;
            const dia = ((h + l - 7 * m + 114) % 31) + 1;
            return new Date(ano, mes, dia);
        }

        // Verificar se é feriado
        function isFeriado(data) {
            const dataStr = data.toISOString().split('T')[0];
            const feriadosNacionais = getFeriadosNacionais(data.getFullYear());
            
            // Verificar feriados nacionais
            if (feriadosNacionais.some(f => f.data === dataStr)) {
                return feriadosNacionais.find(f => f.data === dataStr).nome;
            }
            
            // Verificar feriados personalizados
            if (feriadosPersonalizados.some(f => f.data === dataStr)) {
                return feriadosPersonalizados.find(f => f.data === dataStr).nome;
            }
            
            return false;
        }

        // Gerenciar feriados
        function gerenciarFeriados() {
            const feriadosSection = document.getElementById('feriadosSection');
            if (feriadosSection.style.display === 'none') {
                feriadosSection.style.display = 'block';
                atualizarListaFeriados();
            } else {
                feriadosSection.style.display = 'none';
            }
        }

        // Adicionar feriado personalizado
        function adicionarFeriado() {
            const dataInput = document.getElementById('dataFeriado');
            const nomeInput = document.getElementById('nomeFeriado');
            
            if (dataInput.value && nomeInput.value) {
                feriadosPersonalizados.push({
                    data: dataInput.value,
                    nome: nomeInput.value
                });
                
                dataInput.value = '';
                nomeInput.value = '';
                atualizarListaFeriados();
            } else {
                alert('Por favor, preencha a data e o nome do feriado.');
            }
        }

        // Remover feriado personalizado
        function removerFeriado(index) {
            feriadosPersonalizados.splice(index, 1);
            atualizarListaFeriados();
        }

        // Atualizar lista de feriados
        function atualizarListaFeriados() {
            const feriadosList = document.getElementById('feriadosList');
            const ano = parseInt(document.getElementById('ano').value);
            const todosFeridados = [...getFeriadosNacionais(ano), ...feriadosPersonalizados];
            
            // Ordenar por data
            todosFeridados.sort((a, b) => new Date(a.data) - new Date(b.data));
            
            feriadosList.innerHTML = '';
            todosFeridados.forEach((feriado, index) => {
                const data = new Date(feriado.data + 'T00:00:00');
                const isPersonalizado = feriadosPersonalizados.some(f => f.data === feriado.data);
                
                const div = document.createElement('div');
                div.className = 'feriado-item';
                div.innerHTML = `
                    <div>
                        <strong>${feriado.nome}</strong><br>
                        <small>${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}</small>
                    </div>
                    ${isPersonalizado ? `<button onclick="removerFeriado(${feriadosPersonalizados.findIndex(f => f.data === feriado.data)})">Remover</button>` : '<span style="color: #6c757d; font-size: 0.9em;">Feriado Nacional</span>'}
                `;
                feriadosList.appendChild(div);
            });
        }

        function mostrarCalendario() {
            const calendarioSection = document.getElementById('calendarioSection');
            if (calendarioSection.style.display === 'none') {
                gerarCalendario();
                calendarioSection.style.display = 'block';
            } else {
                calendarioSection.style.display = 'none';
            }
        }

        function gerarCalendario() {
            const mes = parseInt(document.getElementById('mes').value);
            const ano = parseInt(document.getElementById('ano').value);
            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            const calendarioGrid = document.getElementById('calendarioGrid');
            
            calendarioGrid.innerHTML = '';
            
            // Adicionar cabeçalho dos dias da semana
            ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(dia => {
                const header = document.createElement('div');
                header.style.fontWeight = 'bold';
                header.style.textAlign = 'center';
                header.style.padding = '10px';
                header.textContent = dia;
                calendarioGrid.appendChild(header);
            });
            
            // Adicionar dias vazios no início
            const primeiroDia = new Date(ano, mes, 1).getDay();
            for (let i = 0; i < primeiroDia; i++) {
                const vazio = document.createElement('div');
                calendarioGrid.appendChild(vazio);
            }
            
            // Adicionar os dias do mês
            for (let dia = 1; dia <= diasNoMes; dia++) {
                const data = new Date(ano, mes, dia);
                const diaSemana = data.getDay();
                const div = document.createElement('div');
                div.className = 'calendar-day';
                
                const feriado = isFeriado(data);
                if (feriado) {
                    div.classList.add('feriado');
                    div.innerHTML = `${dia}<br><small style="font-size: 0.7em;">${feriado}</small>`;
                } else {
                    div.textContent = dia;
                }
                
                div.onclick = () => mostrarAjusteManual(dia, data);
                
                if (diaSemana === 0 || diaSemana === 6) {
                    div.classList.add('weekend');
                }
                
                calendarioGrid.appendChild(div);
            }
        }

        function mostrarAjusteManual(dia, data) {
            diaAtualAjuste = dia;
            const diaSemana = data.getDay();
            const nomeCompleto = diasSemana[diaSemana];
            const mes = parseInt(document.getElementById('mes').value);
            const ano = parseInt(document.getElementById('ano').value);
            
            document.getElementById('diaInfo').innerHTML = `
                <h4>Ajustar horários para ${dia}/${(mes + 1).toString().padStart(2, '0')}/${ano} - ${nomeCompleto}</h4>
            `;
            
            const scheduleGrid = document.getElementById('scheduleGrid');
            const ajusteAtual = ajustesManual[dia] || {};
            
            scheduleGrid.innerHTML = `
                <div class="schedule-item">
                    <h5>Entrada</h5>
                    <div class="schedule-inputs">
                        <input type="time" id="entradaManual" value="${ajusteAtual.entrada || '08:00'}">
                    </div>
                </div>
                <div class="schedule-item">
                    <h5>Saída</h5>
                    <div class="schedule-inputs">
                        <input type="time" id="saidaManual" value="${ajusteAtual.saida || '17:00'}">
                    </div>
                </div>
                <div class="schedule-item">
                    <h5>Intervalo (min)</h5>
                    <div class="schedule-inputs">
                        <input type="number" id="intervaloManual" value="${ajusteAtual.intervalo || 60}" min="0" max="240">
                    </div>
                </div>
                <div class="schedule-item">
                    <h5>Situação</h5>
                    <div class="schedule-inputs">
                        <select id="situacaoManual" style="width: 100%;">
                            <option value="trabalho" ${ajusteAtual.situacao === 'trabalho' ? 'selected' : ''}>Trabalho</option>
                            <option value="folga" ${ajusteAtual.situacao === 'folga' ? 'selected' : ''}>Folga</option>
                            <option value="feriado" ${ajusteAtual.situacao === 'feriado' ? 'selected' : ''}>Feriado</option>
                        </select>
                    </div>
                </div>
            `;
            
            document.getElementById('ajusteManual').style.display = 'block';
        }

        function salvarAjuste() {
            if (!diaAtualAjuste) return;
            
            const entrada = document.getElementById('entradaManual').value;
            const saida = document.getElementById('saidaManual').value;
            const intervalo = parseInt(document.getElementById('intervaloManual').value);
            const situacao = document.getElementById('situacaoManual').value;
            
            ajustesManual[diaAtualAjuste] = {
                entrada,
                saida,
                intervalo,
                situacao
            };
            
            document.getElementById('ajusteManual').style.display = 'none';
            diaAtualAjuste = null;
            
            // Atualizar calendário se estiver visível
            if (document.getElementById('calendarioSection').style.display !== 'none') {
                gerarCalendario();
            }
        }

        function cancelarAjuste() {
            document.getElementById('ajusteManual').style.display = 'none';
            diaAtualAjuste = null;
        }

        function calcularHoras(entrada, saida, intervalo) {
            if (!entrada || !saida) return { horas: 0, minutos: 0, totalMinutos: 0 };
            
            const [horaEntrada, minEntrada] = entrada.split(':').map(Number);
            const [horaSaida, minSaida] = saida.split(':').map(Number);
            
            let totalMinutos;
            
            // Verificar se é turno noturno (saída menor que entrada)
            if (horaSaida < horaEntrada || (horaSaida === horaEntrada && minSaida < minEntrada)) {
                // Calcula até meia-noite + do início do dia até a saída
                totalMinutos = ((24 - horaEntrada) * 60 - minEntrada) + (horaSaida * 60 + minSaida);
            } else {
                // Cálculo normal
                totalMinutos = (horaSaida * 60 + minSaida) - (horaEntrada * 60 + minEntrada);
            }
            
            // Subtrair intervalo
            totalMinutos = Math.max(0, totalMinutos - intervalo);
            
            const horas = Math.floor(totalMinutos / 60);
            const minutos = totalMinutos % 60;
            
            return { horas, minutos, totalMinutos };
        }

        function formatarHoras(horas, minutos) {
            return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
        }

        function calcularProdutividade() {
            const producaoHora = parseFloat(document.getElementById('producaoHora').value) || 0;
            const unidade = document.getElementById('unidadeMedida').value || 'unidades';
            
            if (producaoHora === 0) {
                document.getElementById('produtividadeSection').style.display = 'none';
                return;
            }
            
            let totalProducao = 0;
            let diasProducao = 0;
            let horasSemanais = {};
            
            dadosSimulacao.forEach(dia => {
                if (dia.horasTrabalhadas && dia.status.includes('Trabalho')) {
                    const [h, m] = dia.horasTrabalhadas.split(':').map(Number);
                    const horasDia = h + (m / 60);
                    totalProducao += horasDia * producaoHora;
                    diasProducao++;
                    
                    // Calcular semana
                    const semana = Math.ceil(dia.dia / 7);
                    if (!horasSemanais[semana]) horasSemanais[semana] = 0;
                    horasSemanais[semana] += horasDia;
                }
            });
            
            const producaoDiaria = diasProducao > 0 ? (totalProducao / diasProducao).toFixed(1) : 0;
            let producaoSemanal = 0;
            
            if (Object.keys(horasSemanais).length > 0) {
                const totalHorasSemanais = Object.values(horasSemanais).reduce((acc, horas) => acc + horas, 0);
                producaoSemanal = (totalHorasSemanais * producaoHora) / Object.keys(horasSemanais).length;
            }
            
            document.getElementById('producaoDiaria').textContent = producaoDiaria;
            document.getElementById('producaoSemanal').textContent = producaoSemanal.toFixed(1);
            document.getElementById('producaoMensal').textContent = totalProducao.toFixed(1);
            
            document.getElementById('unidadeDiaria').textContent = unidade + '/dia';
            document.getElementById('unidadeSemanal').textContent = unidade + '/semana';
            document.getElementById('unidadeMensal').textContent = unidade + '/mês';
            
            document.getElementById('produtividadeSection').style.display = 'block';
        }

        function simularJornada() {
            const mes = parseInt(document.getElementById('mes').value);
            const ano = parseInt(document.getElementById('ano').value);
            const diaEscolhido = parseInt(document.getElementById('diaEscolhido').value);
            const semanaFolga = parseInt(document.getElementById('semanaFolga').value);
            const intervalo = parseInt(document.getElementById('intervalo').value);
            
            const entradaSeg = document.getElementById('entradaSeg').value;
            const saidaSeg = document.getElementById('saidaSeg').value;
            const entradaSab = document.getElementById('entradaSab').value;
            const saidaSab = document.getElementById('saidaSab').value;
            
            dadosSimulacao = [];
            let totalMinutosTrabalhados = 0;
            let diasTrabalhados = 0;
            
            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            const tbody = document.getElementById('simulacaoBody');
            tbody.innerHTML = '';
            
            for (let dia = 1; dia <= diasNoMes; dia++) {
                const data = new Date(ano, mes, dia);
                const diaSemana = data.getDay();
                const semanaDoMes = Math.ceil(dia / 7);
                
                let entrada = '';
                let saida = '';
                let intervaloAtual = intervalo;
                let horasTrabalhadas = '';
                let status = '';
                let rowClass = '';
                
                // Verificar ajuste manual primeiro
                if (ajustesManual[dia]) {
                    const ajuste = ajustesManual[dia];
                    if (ajuste.situacao === 'folga' || ajuste.situacao === 'feriado') {
                        status = ajuste.situacao === 'folga' ? 'Folga' : 'Feriado';
                        rowClass = ajuste.situacao;
                    } else {
                        entrada = ajuste.entrada;
                        saida = ajuste.saida;
                        intervaloAtual = ajuste.intervalo;
                        const { horas, minutos, totalMinutos } = calcularHoras(entrada, saida, intervaloAtual);
                        horasTrabalhadas = formatarHoras(horas, minutos);
                        totalMinutosTrabalhados += totalMinutos;
                        diasTrabalhados++;
                        status = 'Trabalho';
                    }
                } else {
                    // Verificar se é feriado nacional
                    const feriado = isFeriado(data);
                    if (feriado) {
                        status = `Feriado - ${feriado}`;
                        rowClass = 'feriado';
                    } else if (diaSemana === 0) {
                        status = 'Domingo';
                        rowClass = 'weekend';
                    } else if (diaEscolhido !== -1 && diaSemana === diaEscolhido && semanaFolga !== 0 && semanaDoMes === semanaFolga) {
                        status = 'Folga Semanal';
                        rowClass = 'folga';
                    } else if (diaSemana === 6) {
                        entrada = entradaSab;
                        saida = saidaSab;
                        const { horas, minutos, totalMinutos } = calcularHoras(entrada, saida, intervaloAtual);
                        horasTrabalhadas = formatarHoras(horas, minutos);
                        totalMinutosTrabalhados += totalMinutos;
                        diasTrabalhados++;
                        status = 'Trabalho';
                        rowClass = 'weekend';
                    } else {
                        entrada = entradaSeg;
                        saida = saidaSeg;
                        const { horas, minutos, totalMinutos } = calcularHoras(entrada, saida, intervaloAtual);
                        horasTrabalhadas = formatarHoras(horas, minutos);
                        totalMinutosTrabalhados += totalMinutos;
                        diasTrabalhados++;
                        status = 'Trabalho';
                    }
                }
                
                // Para turno noturno, adicionar indicação de continuação
                const turnoNoturno = document.getElementById('turnoNoturno').checked;
                if (turnoNoturno && status === 'Trabalho' && entrada) {
                    const [horaEntrada] = entrada.split(':').map(Number);
                    const [horaSaida] = saida.split(':').map(Number);
                    if (horaEntrada >= 18 || horaSaida <= 6) {
                        status += ' (Noturno)';
                    }
                }
                
                const row = tbody.insertRow();
                row.className = rowClass;
                row.innerHTML = `
                    <td>${dia}</td>
                    <td>${dia.toString().padStart(2, '0')}/${(mes + 1).toString().padStart(2, '0')}/${ano}</td>
                    <td>${diasSemana[diaSemana]}</td>
                    <td>${entrada}</td>
                    <td>${saida}</td>
                    <td>${intervaloAtual || '-'}</td>
                    <td>${horasTrabalhadas}</td>
                    <td>${status}</td>
                `;
                
                dadosSimulacao.push({
                    dia,
                    diaSemana: diasSemana[diaSemana],
                    entrada,
                    saida,
                    intervalo: intervaloAtual,
                    horasTrabalhadas,
                    status
                });
            }
            
            // Calcular totais
            const totalHoras = Math.floor(totalMinutosTrabalhados / 60);
            const totalMinutos = totalMinutosTrabalhados % 60;
            const saldoMinutos = totalMinutosTrabalhados - (220 * 60);
            const saldoHoras = Math.floor(Math.abs(saldoMinutos) / 60);
            const saldoMin = Math.abs(saldoMinutos) % 60;
            const percentual = ((totalMinutosTrabalhados / (220 * 60)) * 100).toFixed(1);
            const mediaMinutos = diasTrabalhados > 0 ? Math.floor(totalMinutosTrabalhados / diasTrabalhados) : 0;
            const mediaHoras = Math.floor(mediaMinutos / 60);
            const mediaMin = mediaMinutos % 60;
            
            // Atualizar métricas
            document.getElementById('totalHoras').textContent = formatarHoras(totalHoras, totalMinutos);
            document.getElementById('saldo').textContent = (saldoMinutos >= 0 ? '+' : '-') + formatarHoras(saldoHoras, saldoMin);
            document.getElementById('saldo').className = saldoMinutos >= 0 ? 'metric-value warning' : 'metric-value success';
            document.getElementById('diasTrabalhados').textContent = diasTrabalhados;
            document.getElementById('mediaHoras').textContent = formatarHoras(mediaHoras, mediaMin);
            document.getElementById('percentualLimite').textContent = percentual + '%';
            document.getElementById('percentualLimite').className = percentual > 100 ? 'metric-value danger' : 'metric-value success';
            
            // Alerta de resultado
            const alertDiv = document.getElementById('alertaResultado');
            if (saldoMinutos > 0) {
                alertDiv.className = 'alert alert-danger';
                alertDiv.innerHTML = `<strong>Atenção!</strong> A jornada excede o limite legal em ${formatarHoras(saldoHoras, saldoMin)} horas.`;
            } else {
                alertDiv.className = 'alert alert-success';
                alertDiv.innerHTML = `<strong>Jornada dentro do limite legal!</strong> Saldo de ${formatarHoras(saldoHoras, saldoMin)} horas.`;
            }
            
            // Mostrar resultados
            document.getElementById('resultados').style.display = 'block';
            document.getElementById('graficoContainer').style.display = 'block';
            
            // Calcular produtividade
            calcularProdutividade();
            
            // Gerar gráfico
            gerarGrafico();
            
            // Atualizar resumo de produção no gráfico
            const producaoHora = parseFloat(document.getElementById('producaoHora').value) || 0;
            if (producaoHora > 0) {
                let totalProduzido = 0;
                let diasProdutivos = 0;
                
                dadosSimulacao.forEach(dia => {
                    if (dia.horasTrabalhadas && dia.status.includes('Trabalho')) {
                        const [h, m] = dia.horasTrabalhadas.split(':').map(Number);
                        const horasDia = h + (m / 60);
                        totalProduzido += horasDia * producaoHora;
                        diasProdutivos++;
                    }
                });
                
                const unidade = document.getElementById('unidadeMedida').value || 'unidades';
                document.getElementById('totalProduzidoGrafico').textContent = `${totalProduzido.toFixed(1)} ${unidade}`;
                document.getElementById('mediaProduzidoGrafico').textContent = diasProdutivos > 0 ? `${(totalProduzido / diasProdutivos).toFixed(1)} ${unidade}` : `0 ${unidade}`;
                document.getElementById('diasProdutivosGrafico').textContent = diasProdutivos;
                document.getElementById('resumoProducao').style.display = 'block';
            } else {
                document.getElementById('resumoProducao').style.display = 'none';
            }
        }

        function gerarGrafico() {
            const ctx = document.getElementById('graficoTendencia').getContext('2d');
            
            // Destruir gráfico anterior se existir
            if (graficoTendencia) {
                graficoTendencia.destroy();
            }
            
            const labels = [];
            const dataTrabalhadas = [];
            const dataNaoTrabalhadas = [];
            const dataProducao = [];
            
            const producaoHora = parseFloat(document.getElementById('producaoHora').value) || 0;
            const temProducao = producaoHora > 0;
            
            dadosSimulacao.forEach(dia => {
                labels.push(`${dia.dia}`);
                
                if (dia.horasTrabalhadas) {
                    const [h, m] = dia.horasTrabalhadas.split(':').map(Number);
                    const horasTotais = h + (m / 60);
                    dataTrabalhadas.push(horasTotais);
                    dataNaoTrabalhadas.push(0);
                    
                    // Calcular produção do dia
                    if (temProducao) {
                        dataProducao.push(horasTotais * producaoHora);
                    }
                } else {
                    dataTrabalhadas.push(0);
                    dataNaoTrabalhadas.push(8); // Mostrar 8 horas como referência para dias não trabalhados
                    if (temProducao) {
                        dataProducao.push(0);
                    }
                }
            });
            
            const datasets = [
                {
                    label: 'Horas Trabalhadas',
                    data: dataTrabalhadas,
                    backgroundColor: 'rgba(254, 80, 0, 0.8)',
                    borderColor: '#fe5000',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Dias Não Trabalhados',
                    data: dataNaoTrabalhadas,
                    backgroundColor: 'rgba(220, 220, 220, 0.5)',
                    borderColor: '#dcdcdc',
                    borderWidth: 1,
                    yAxisID: 'y'
                }
            ];
            
            // Adicionar linha de produção se configurada
            if (temProducao) {
                datasets.push({
                    label: 'Produção Diária',
                    data: dataProducao,
                    type: 'line',
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 3,
                    tension: 0.1,
                    yAxisID: 'y1',
                    pointRadius: 4,
                    pointBackgroundColor: '#28a745'
                });
            }
            
            const scales = {
                x: {
                    title: {
                        display: true,
                        text: 'Dias do Mês'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Horas'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + 'h';
                        }
                    }
                }
            };
            
            // Adicionar segundo eixo Y para produção
            if (temProducao) {
                scales.y1 = {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: `Produção (${document.getElementById('unidadeMedida').value || 'unidades'})`
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                };
            }
            
            graficoTendencia = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    if (context.dataset.label === 'Horas Trabalhadas' && context.parsed.y > 0) {
                                        const value = context.parsed.y;
                                        const hours = Math.floor(value);
                                        const minutes = Math.round((value - hours) * 60);
                                        return `Trabalhado: ${hours}h${minutes.toString().padStart(2, '0')}min`;
                                    } else if (context.dataset.label === 'Dias Não Trabalhados' && context.parsed.y > 0) {
                                        const dia = dadosSimulacao[context.dataIndex];
                                        return `${dia.status}`;
                                    } else if (context.dataset.label === 'Produção Diária' && context.parsed.y > 0) {
                                        const unidade = document.getElementById('unidadeMedida').value || 'unidades';
                                        return `Produção: ${context.parsed.y.toFixed(1)} ${unidade}`;
                                    }
                                    return '';
                                }
                            }
                        }
                    },
                    scales: scales
                }
            });
        }

        function gerarRelatorio() {
            if (dadosSimulacao.length === 0) {
                alert('Por favor, simule a jornada primeiro!');
                return;
            }
            
            document.getElementById('comparacao').style.display = 'block';
            
            const vantagens = document.getElementById('vantagens');
            const atencoes = document.getElementById('atencoes');
            
            vantagens.innerHTML = '';
            atencoes.innerHTML = '';
            
            const totalHoras = document.getElementById('totalHoras').textContent;
            const percentual = parseFloat(document.getElementById('percentualLimite').textContent);
            
            // Análise das vantagens
            if (percentual <= 100) {
                vantagens.innerHTML += '<li>Jornada está dentro do limite legal de 220 horas mensais</li>';
            }
            
            if (dadosSimulacao.filter(d => d.status === 'Folga Semanal').length >= 4) {
                vantagens.innerHTML += '<li>Funcionário tem pelo menos uma folga semanal garantida</li>';
            }
            
            const sabadosTrabalhados = dadosSimulacao.filter(d => d.diaSemana === 'Sábado' && d.status === 'Trabalho').length;
            if (sabadosTrabalhados <= 3) {
                vantagens.innerHTML += '<li>Modelo permite alguns sábados de folga no mês</li>';
            }
            
            // Pontos de atenção
            if (percentual > 100) {
                atencoes.innerHTML += '<li>Jornada excede o limite legal - necessário ajustar horários</li>';
            }
            
            if (percentual > 95 && percentual <= 100) {
                atencoes.innerHTML += '<li>Jornada muito próxima do limite - pouca margem para horas extras</li>';
            }
            
            const horasSegSex = dadosSimulacao.filter(d => 
                ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].includes(d.diaSemana) && 
                d.horasTrabalhadas
            ).map(d => {
                const [h, m] = d.horasTrabalhadas.split(':').map(Number);
                return h + (m / 60);
            });
            
            const mediaSegSex = horasSegSex.reduce((a, b) => a + b, 0) / horasSegSex.length;
            if (mediaSegSex > 8.8) {
                atencoes.innerHTML += '<li>Jornada diária de segunda a sexta muito longa - considere reduzir</li>';
            }
            
            if (!vantagens.innerHTML) {
                vantagens.innerHTML = '<li>Revise os parâmetros da simulação</li>';
            }
            
            if (!atencoes.innerHTML) {
                atencoes.innerHTML = '<li>Modelo bem equilibrado - sem pontos críticos identificados</li>';
            }
        }

        function exportarCSV() {
            if (dadosSimulacao.length === 0) {
                alert('Por favor, simule a jornada primeiro!');
                return;
            }
            
            let csv = 'Dia,Data,Dia da Semana,Entrada,Saída,Intervalo,Horas Trabalhadas,Status\n';
            
            dadosSimulacao.forEach(dia => {
                const mes = parseInt(document.getElementById('mes').value);
                const ano = parseInt(document.getElementById('ano').value);
                const data = `${dia.dia.toString().padStart(2, '0')}/${(mes + 1).toString().padStart(2, '0')}/${ano}`;
                
                csv += `${dia.dia},${data},${dia.diaSemana},${dia.entrada},${dia.saida},${dia.intervalo || '-'},${dia.horasTrabalhadas},${dia.status}\n`;
            });
            
            // Adicionar resumo
            csv += '\n\nRESUMO\n';
            csv += `Total de Horas,${document.getElementById('totalHoras').textContent}\n`;
            csv += `Dias Trabalhados,${document.getElementById('diasTrabalhados').textContent}\n`;
            csv += `Média Horas/Dia,${document.getElementById('mediaHoras').textContent}\n`;
            csv += `Percentual do Limite,${document.getElementById('percentualLimite').textContent}\n`;
            csv += `Saldo,${document.getElementById('saldo').textContent}\n`;
            
            // Adicionar produtividade se configurada
            const producaoHora = parseFloat(document.getElementById('producaoHora').value) || 0;
            if (producaoHora > 0) {
                csv += '\n\nPRODUTIVIDADE\n';
                csv += `Produção por Hora,${producaoHora} ${document.getElementById('unidadeMedida').value}\n`;
                csv += `Produção Diária Média,${document.getElementById('producaoDiaria').textContent}\n`;
                csv += `Produção Semanal,${document.getElementById('producaoSemanal').textContent}\n`;
                csv += `Produção Mensal Total,${document.getElementById('producaoMensal').textContent}\n`;
            }
            
            // Download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `simulacao_jornada_${meses[document.getElementById('mes').value]}_${document.getElementById('ano').value}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Inicializar com o mês atual
        document.getElementById('mes').value = new Date().getMonth();
        document.getElementById('ano').value = new Date().getFullYear();