export class Player{
    constructor(
        public _id: string,
        public name: string,
        public game: string,
        public position: number,
        public stack: number,
        public card1: string,
        public card2: string,
        public playing: boolean,
        public myTurn: boolean,
        public dealer: boolean
    ){}
}