let id = 0;

export default class PDBAtom {
    constructor(string) {
        this.id = ++id;
        this.name = string.slice(12, 17).trim();
        this.x = parseFloat(string.slice(30, 38).trim())
        this.y = parseFloat(string.slice(38, 46).trim())
        this.z = parseFloat(string.slice(46, 54).trim())
        this.warnings = []
        if (string.length < 78) {
            this.element = string.slice(12, 16).trim()
            this.warnings.push(`Chemical element name guessed to be ${this.element} from atom name ${this.name} `)
        } else {
            this.element = string.slice(76, 78).trim()
        }
        this.bonds = []
    }
}