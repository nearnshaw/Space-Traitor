"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoomState = exports.FuseBox = exports.Equiptment = exports.Player = void 0;
const schema_1 = require("@colyseus/schema");
const config_1 = require("../config");
class Player extends schema_1.Schema {
    constructor(id, name, thumb) {
        super();
        this.votes = new schema_1.ArraySchema();
        this.id = id;
        this.name = name;
        this.thumb = thumb ? thumb : null;
        this.isTraitor = false;
        this.alive = true;
        this.ready = false;
        this.votes = new schema_1.ArraySchema();
    }
    reset() {
        this.ready = false;
        this.alive = false;
        this.isTraitor = false;
        this.votes = new schema_1.ArraySchema();
    }
}
__decorate([
    schema_1.type('string')
], Player.prototype, "id", void 0);
__decorate([
    schema_1.type('string')
], Player.prototype, "name", void 0);
__decorate([
    schema_1.type('string')
], Player.prototype, "thumb", void 0);
__decorate([
    schema_1.type('boolean')
], Player.prototype, "isTraitor", void 0);
__decorate([
    schema_1.type('boolean')
], Player.prototype, "alive", void 0);
__decorate([
    schema_1.type(['string'])
], Player.prototype, "votes", void 0);
__decorate([
    schema_1.type('boolean')
], Player.prototype, "ready", void 0);
exports.Player = Player;
class Equiptment extends schema_1.Schema {
    constructor(id) {
        super();
        this.id = id;
        this.broken = false;
    }
    reset() {
        this.broken = false;
    }
}
__decorate([
    schema_1.type('number')
], Equiptment.prototype, "id", void 0);
__decorate([
    schema_1.type('boolean')
], Equiptment.prototype, "broken", void 0);
exports.Equiptment = Equiptment;
class FuseBox extends schema_1.Schema {
    constructor(id) {
        super();
        this.id = id;
        this.doorOpen = false;
        this.redCut = false;
        this.greenCut = false;
        this.blueCut = false;
        this.broken = false;
    }
    reset() {
        this.doorOpen = false;
        this.redCut = false;
        this.greenCut = false;
        this.blueCut = false;
        this.broken = false;
    }
}
__decorate([
    schema_1.type('number')
], FuseBox.prototype, "id", void 0);
__decorate([
    schema_1.type('boolean')
], FuseBox.prototype, "doorOpen", void 0);
__decorate([
    schema_1.type('boolean')
], FuseBox.prototype, "redCut", void 0);
__decorate([
    schema_1.type('boolean')
], FuseBox.prototype, "greenCut", void 0);
__decorate([
    schema_1.type('boolean')
], FuseBox.prototype, "blueCut", void 0);
__decorate([
    schema_1.type('boolean')
], FuseBox.prototype, "broken", void 0);
exports.FuseBox = FuseBox;
class MyRoomState extends schema_1.Schema {
    constructor(boxCount = 4, equiptCount = 8) {
        super();
        this.fuseBoxes = new schema_1.ArraySchema();
        this.toFix = new schema_1.ArraySchema();
        this.players = new schema_1.MapSchema();
        this.active = false;
        this.paused = false;
        this.fixCount = 0;
        this.traitors = 0;
        this.countdown = config_1.GAME_DURATION;
        this.votingCountdown = config_1.VOTING_TIME;
        for (let i = 0; i < config_1.FUSE_BOXES; i++) {
            this.fuseBoxes.push(new FuseBox(i));
        }
        for (let j = 0; j < config_1.EQUIPT_COUNT; j++) {
            this.toFix.push(new Equiptment(j));
        }
    }
}
__decorate([
    schema_1.type('boolean')
], MyRoomState.prototype, "active", void 0);
__decorate([
    schema_1.type('boolean')
], MyRoomState.prototype, "paused", void 0);
__decorate([
    schema_1.type('number')
], MyRoomState.prototype, "fixCount", void 0);
__decorate([
    schema_1.type('number')
], MyRoomState.prototype, "traitors", void 0);
__decorate([
    schema_1.type('number')
], MyRoomState.prototype, "countdown", void 0);
__decorate([
    schema_1.type('number')
], MyRoomState.prototype, "votingCountdown", void 0);
__decorate([
    schema_1.type([FuseBox])
], MyRoomState.prototype, "fuseBoxes", void 0);
__decorate([
    schema_1.type([Equiptment])
], MyRoomState.prototype, "toFix", void 0);
__decorate([
    schema_1.type({ map: Player })
], MyRoomState.prototype, "players", void 0);
exports.MyRoomState = MyRoomState;
