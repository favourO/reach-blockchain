import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

const stdlib = loadStdlib(process.env);

(async () => {
    const startingBalance = stdlib.parseCurrency(10);
    const accAlice = await stdlib.newTestAccount(startingBalance);
    const accBob = await stdlib.newTestAccount(startingBalance);
    const ctcAlice = accAlice.contract(backend);
    const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

    const fmt = (x) => stdlib.formatCurrency(x, 4);
    const getBalance = async (Who) => fmt(await stdlib.balanceOf(Who));
    const beforeAlice = await getBalance(accAlice);
    const beforeBob = await getBalance(accBob);

    const HAND = ['Rock', 'Paper', 'Scissors'];
    const OUTCOME = ['Bob wins', 'Draw', 'Alice wins']
    const Player = (Who) => ({
        ...stdlib.hasRandom,
        getHand: () => {
            const hand = Math.floor(Math.random() * 3);
            console.log(`${Who} Played ${HAND[hand]}`)
            return hand
        },
        seeOutcome: (outcome) => {
            console.log(`${Who} saw outcome ${OUTCOME[outcome]}`)
        }
    })
    await Promise.all([
        backend.Alice(ctcAlice, {
            ...Player('Alice'),
            wager: stdlib.parseCurrency(5),
        }),

        backend.Bob(ctcBob, {
            ...Player('Bob'),
            acceptWager: (amt) => {
                console.log(`Bob accept the wager of ${fmt(amt)}.`)
            },
        }),

    ]);

    const afterAlice = await getBalance(accAlice);
    const afterBob = await getBalance(accBob);

    console.log(`Alice went from ${beforeAlice} to ${afterAlice}.`);
    console.log(`Bob went from ${beforeBob} to ${afterBob}`);
})();