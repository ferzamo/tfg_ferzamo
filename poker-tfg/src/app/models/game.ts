import {Blind} from './blind';

export class Game{
    constructor(
        public _id: string,
        public speed: string,
        public stack: number,
        public pot: number,
        public highestBet: number,
        public flop1: string,
        public flop2: string,
        public flop3: string,
        public turn: string,
        public river: string,
        public state: string,
        public blind: Blind[]
        
    ){}
}