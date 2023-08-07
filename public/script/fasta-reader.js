
//     drawPlot() {
//         this.data = [{
//             type: "pie",
//             values: Object.keys(this.countData).map(key => this.countData[key]),
//             labels: Object.keys(this.countData).map(key => key),
//             textinfo: "label+percent",
//             textposition: "outside",
//             automargin: true,
//             marker: {colors: ['gold', 'mediumturquoise', 'darkorange', 'lightgreen'], line: {color: '#000000', width: 2}},
//             textfont: { color: "white", size: 18 },
//         }]
//         Plotly.newPlot("tester", this.data, this.layout, this.config);

//         document.getElementById("ORFS").insertBefore(pageFunctions.htmlToElement(`<div class="col-span-8"><p class="text-center font-thin"><span style="color: rgb(0,255,0);">Startcodon</span> <span style="color: rgb(247, 25, 25);">Stopcodon</span></p></div>`), document.getElementById("ORFS").firstChild);
//         document.getElementById("ORFS-seq").appendChild(pageFunctions.htmlToElement(`<p class="pt-2">${this.seq}</p>`))
//         document.getElementById("ORFS-name").appendChild(pageFunctions.htmlToElement(`<p class="pt-2">Sequence</p>`))
//         for (const ORF in this.ORFS) {
//             const highlightedSequence = this.ORFS[ORF].sequence.replace(this.startCodonRegex,'<span style="color: green;">$&</span>').replace(this.stopCodonRegex, '<span style="color: red;">$&</span>')
//             document.getElementById("ORFS-seq").appendChild(pageFunctions.htmlToElement(`<p class="pt-2">${highlightedSequence}</p>`))
//             document.getElementById("ORFS-name").appendChild(pageFunctions.htmlToElement(`<p class="pt-2">${this.ORFS[ORF].name}</p>`))
//         }
//     },
// }



class Sequence {
    gcContent = [];
    countData = {};
    ORFS = [];
    complementMap = {};
    codonTable = {};
    constructor(seq) {
        this.seq = seq
    }
    getStats() {
        this.getComplementSeq()
        this.getGCContent()
        this.getReadingFrames()
    }
    getGCContent() {
        let gcCount = 0;
        for (let i = 0; i < this.seq.length; i++) {
            const nucleotide = this.seq[i].toUpperCase();
            if (nucleotide === 'G' || nucleotide === 'C') { gcCount++; }
            const gcPercentage = (gcCount / (i + 1)) * 100;
            this.gcContent.push(gcPercentage);
        }
    }
    getComplementSeq() {
        this.complementSeq = this.seq.split('').map(i => this.complementMap[i]).join('');
    }
    getReadingFrames() {
        for (const nucl of this.seq) {
            this.countData[nucl] = this.countData[nucl] ? this.countData[nucl] + 1 : 1;
        }
        for (let i = 0; i < 6; i++) {
            let frame;
            let name;
            let seq;
            if (i < 3) {
                frame = this.seq.slice(i);
                name = `F ${i + 1}`
                seq = frame.match(/.{1,3}/g).map(triplet => {if (triplet.length === 3) {return this.codonTable[triplet];}}).join('&nbsp;&nbsp;')
                for (let j = 0; j < i; j++) seq = '&nbsp;' + seq
            } else {
                frame = this.complementSeq.slice(i);
                name = `R ${i % 3 + 1}`
                seq = frame.match(/.{1,3}/g).map(triplet => {if (triplet.length === 3) {return this.codonTable[triplet];}}).join('&nbsp;&nbsp;')
                for (let j = 0; j < i % 3; j++) seq = '&nbsp;' + seq
            }
            this.ORFS.push({
                name: name,
                sequence: seq
            })
        }
    }
}

class DNA extends Sequence {
    complementMap = { 'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C' }
    codonTable = {
    'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
    'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
    'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
    'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
    'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
    'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
    'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
    'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
    'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
    'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
    'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
    'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
    'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
    'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
    'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
    'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G',
    }
    constructor(seq) {
        super(seq)
    }
}

class RNA extends Sequence {
    complementMap = { 'A': 'U', 'U': 'A', 'C': 'G', 'G': 'C' }
    codonTable = {
        'UUU': 'F', 'UUC': 'F', 'UUA': 'L', 'UUG': 'L',
        'UCU': 'S', 'UCC': 'S', 'UCA': 'S', 'UCG': 'S',
        'UAU': 'Y', 'UAC': 'Y', 'UAA': '*', 'UAG': '*',
        'UGU': 'C', 'UGC': 'C', 'UGA': '*', 'UGG': 'W',
        'CUU': 'L', 'CUC': 'L', 'CUA': 'L', 'CUG': 'L',
        'CCU': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
        'CAU': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
        'CGU': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
        'AUU': 'I', 'AUC': 'I', 'AUA': 'I', 'AUG': 'M',
        'ACU': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
        'AAU': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
        'AGU': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
        'GUU': 'V', 'GUC': 'V', 'GUA': 'V', 'GUG': 'V',
        'GCU': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
        'GAU': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
        'GGU': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G',
    }
    constructor(seq) {
        super(seq)
    }
}

class BarPlot {
    layout = {
        autosize: true,
        title: 'GC Content Plot',
        titlefont: { color: 'white' },
        showlegend: true,
        xaxis: {
            title: 'Position',
            tickfont: { color: 'white' },
            titlefont: { color: 'white' }
        },
        yaxis: {
            title: 'GC Content (%)',
            tickfont: { color: 'white' },
            titlefont: { color: 'white' }
        },
        legend: { orientation: "h", font: {color: 'white'}, x: 0, y: 1, },
        plot_bgcolor:"#111827",
        paper_bgcolor:"#111827",
    }
    traces = [
        { x: [], y: [], type: 'bar', marker: {color: "red"}, name: "> 49%" },
        { x: [], y: [], type: 'bar', marker: {color: "orange"}, name: "38-49%" },
        { x: [], y: [], type: 'bar', marker: {color: "green"}, name: "25-37%" },
        { x: [], y: [], type: 'bar', marker: {color: "lightblue"}, name: "13-24%" },
        { x: [], y: [], type: 'bar', marker: {color: "darkblue"}, name: "< 13%" },
    ]
    config = { responsive: true }
    constructor(data, div) {
        this.data = data;
        this.div = div;
    }
    getLayout() {
        return this.layout
    }
    setData() {
        for (let i = 0; i < this.data.length; i++) {
            let gc = this.data[i];
            if (gc == 0) {
                this.traces[4].y.push(null);
                this.traces[4].x.push(i);
            } else if (gc < 13) {
                this.traces[4].y.push(gc);
                this.traces[4].x.push(i);
            } else if (gc < 25) {
                this.traces[3].y.push(gc);
                this.traces[3].x.push(i);
            }
            else if (gc < 38) {
                this.traces[2].y.push(gc);
                this.traces[2].x.push(i);
            }
            else if (gc < 50) {
                this.traces[1].y.push(gc);
                this.traces[1].x.push(i);
            } else {
                this.traces[0].y.push(gc);
                this.traces[0].x.push(i);
            }
        }
        for (let i = 0; i < this.traces.length; i++) {
            if (!this.traces[i].x.length) {
                this.traces[i].x = [null]
                this.traces[i].y = [null]
                this.traces[i].hoverinfo = 'none'
            }
        }
    }
    drawPlot() {
        this.setData()
        Plotly.newPlot(this.div, this.traces, this.layout, this.config)
    }
}

class PiePlot {
    config = { responsive: true }
    layout = {
        autosize: true,
        showlegend: false,
        mode: 'lines+markers+text',
        textinfo: "label",
        textposition: "outside",
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0,
            pad: 4
        },
        plot_bgcolor:"#111827",
        paper_bgcolor:"#111827",
    }
    getLayout() {
        return this.layout
    }
    constructor(data, div) {
        this.data = data
        this.div = div
    }
    setData() {
        this.traces = [{
            type: "pie",
            values: Object.keys(this.data).map(key => this.data[key]),
            labels: Object.keys(this.data).map(key => key),
            textinfo: "label+percent",
            textposition: "outside",
            automargin: true,
            marker: {colors: ['gold', 'mediumturquoise', 'darkorange', 'lightgreen'], line: {color: '#000000', width: 2}},
            textfont: { color: "white", size: 18 },
            width: 800, height: 400
        }]
    }
    drawPlot() {
        this.setData()
        Plotly.newPlot(this.div, this.traces, this.layout, this.config)
    }
}

let sequenceContainer = {
    dnaRegex: /^[ACGT]+$/i,
    rnaRegex: /^[ACGU]+$/i,
    startCodonRegex: new RegExp(/M/, 'g'),
    stopCodonRegex: new RegExp(/\*/, 'g'),
    checkSequence(e) {
        let sequence;
        let content = e.target.result.split("\n");
        let seq = content.filter(line => { return (line && !line.startsWith(">")); }).join("").toUpperCase();
        if (sequenceContainer.dnaRegex.test(seq)) {
            sequence = new DNA(seq)
        } else if (sequenceContainer.rnaRegex.test(seq)) {
            sequence = new RNA(seq)
        } else {
            pageFunctions.showToast("This is not a DNA/RNA fasta file")
            document.getElementById("file_input").value = ""
            return;
        }
        sequence.getStats()
        pageFunctions.addPlots(sequence)
        pageFunctions.hideLoader()
    },
}


let pageFunctions = {
    divBar: 'gc-plot',
    divPie: 'pie-plot',
    button: document.getElementById("submitButton"),
    loadingsvg: '<svg aria-hidden="true" role="status" class="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/></svg>',
    submitFasta(e) {
        e.preventDefault();
        pageFunctions.run()
    },
    addPlots(sequence) {
        document.getElementById("main-body").appendChild(pageFunctions.htmlToElement(`<div class="col-span-3 rounded-lg bg-gray-800 grid grid-cols-8 overflow-y-auto my-2 gap-x-10 px-1" id="ORFS">
        <div class="col-span-1" id="ORFS-name"></div>
        <div class="col-span-7 overflow-y-auto" id="ORFS-seq"></div>
    </div>`))
        document.getElementById("main-body").appendChild(pageFunctions.htmlToElement(`<div class="col-span-3"><div id="pie-plot" class="plot-div"></div></div>`))
        document.getElementById("main-body").appendChild(pageFunctions.htmlToElement(`<div class="col-span-3"><div id="gc-plot" class="plot-div"></div></div>`))
        this.addORF(sequence)
        new BarPlot(sequence.gcContent, this.divBar).drawPlot()
        new PiePlot(sequence.countData, this.divPie).drawPlot()
    },
    addORF(sequence) {
        document.getElementById("ORFS").insertBefore(pageFunctions.htmlToElement(`<div class="col-span-8"><p class="text-center font-thin"><span style="color: rgb(0,255,0);">Startcodon</span> <span style="color: rgb(247, 25, 25);">Stopcodon</span></p></div>`), document.getElementById("ORFS").firstChild);
        document.getElementById("ORFS-seq").appendChild(pageFunctions.htmlToElement(`<p class="pt-2">${sequence.seq}</p>`))
        document.getElementById("ORFS-name").appendChild(pageFunctions.htmlToElement(`<p class="pt-2">Sequence</p>`))
        for (const ORF in sequence.ORFS) {
            const highlightedSequence = sequence.ORFS[ORF].sequence.replace(sequenceContainer.startCodonRegex,'<span style="color: green;">$&</span>').replace(sequenceContainer.stopCodonRegex, '<span style="color: red;">$&</span>')
            document.getElementById("ORFS-seq").appendChild(pageFunctions.htmlToElement(`<p class="pt-2">${highlightedSequence}</p>`))
            document.getElementById("ORFS-name").appendChild(pageFunctions.htmlToElement(`<p class="pt-2">${sequence.ORFS[ORF].name}</p>`))
        }
    },
    htmlToElement(html) {
        var template = document.createElement('template');
        html = html.trim();
        template.innerHTML = html;
        return template.content.firstChild;
    },
    run() {
        this.showLoader();
        let file = document.getElementById("file_input").files
        if (!file.length) {
            this.showToast("Please upload a file!")
            this.hideLoader()
            return;
        }
        let toast = document.getElementById("model-error")
        if (toast) toast.remove();
        let reader = new FileReader();
        reader.addEventListener('load', sequenceContainer.checkSequence)
        reader.readAsText(file[0], "UTF-8")
    },
    showLoader() {
        this.button.textContent = "Loading...";
        this.button.insertBefore(this.htmlToElement(this.loadingsvg), this.button.firstChild);
    },
    hideLoader() {
        this.button.childNodes[0].remove();
        this.button.textContent = "Submit";
    },
    showToast(text) {
        let toast = document.getElementById("model-error")
        if (toast) toast.remove();
        let element = this.htmlToElement(`
        <div id="model-error" class="fixed flex items-center w-full max-w-xs p-4 space-x-4 rounded-lg shadow top-[20%] left-[50%] text-gray-400 divide-gray-700 space-x bg-gray-800" role="alert">
            <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-red-800 text-red-200">
                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                </svg>
                <span class="sr-only">Error icon</span>
            </div>
            <div class="ml-3 text-sm font-normal">${text}</div>
            <button type="button" onclick='document.getElementById("model-error").remove()' class="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex items-center justify-center h-8 w-8 text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700" aria-label="Close">
                <span class="sr-only">Close</span>
                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
            </button>
        </div>
        `)
        document.body.appendChild(element);
    }
}


//TODO: REMOEV TABS

document.getElementById("submitButton").addEventListener('click', pageFunctions.submitFasta)