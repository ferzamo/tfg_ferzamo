export class Game{
    constructor(
        public _id: string,
        public speed: string,
        public stack: number,
        public pot: number,
        public flop1: string,
        public flop2: string,
        public flop3: string,
        public turn: string,
        public river: string,
        public state: string
        
    ){}
}