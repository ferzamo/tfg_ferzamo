export class Game{
    constructor(
        
        public speed: string,
        public stack: number,
        public pot: number,
        public flop1: string,
        public flop2: string,
        public flop3: string,
        public turn: string,
        public river: string,
        public _id?: string,
    ){}
}