import euroCoin from '../assets/euro-coin.png';

const DEFAULTS = {
    title: '1 Euro rein,\nnur die Hälfte wieder raus.',
    body: 'Laut Krebs und Kaczmarczyk liegt der kurzfristige Multiplikator deutscher Militärausgaben bei maximal etwa 0,5. Das heißt: Zusätzliche Rüstungsausgaben wirken ökonomisch deutlich schwächer als Investitionen in Infrastruktur, Bildung oder Betreuung.',
    kicker: 'Quelle: Krebs & Kaczmarczyk, 2025',
    coinImage: euroCoin,
    className: '',
};

let stylesInstalled = false;

function installMannheimerStyles() {
    if (stylesInstalled) return;
    stylesInstalled = true;

    const style = document.createElement('style');
    style.id = 'mannheimer-animation-styles';
    style.textContent = `
        .mannheimer-shell {
            --coin-size: clamp(250px, 33vw, 380px);
            --printed-width: min(46vw, 33rem);
            width: min(100%, 1120px);
            min-height: clamp(430px, 54vw, 590px);
            margin: 48px auto;
            position: relative;
            overflow: hidden;
            border-radius: 32px;
            background:
                radial-gradient(circle at 50% 52%, rgba(213, 191, 99, .20), transparent 31%),
                linear-gradient(135deg, rgba(255,255,255,.08), rgba(139,215,255,.04));
            border: 1px solid rgba(255,255,255,.12);
            box-shadow: 0 24px 70px rgba(0,0,0,.28);
            isolation: isolate;
        }

        .mannheimer-shell *,
        .mannheimer-shell *::before,
        .mannheimer-shell *::after {
            box-sizing: border-box;
        }

        .mannheimer-coin {
            position: absolute;
            left: 50%;
            top: 50%;
            width: var(--coin-size);
            height: var(--coin-size);
            z-index: 8;
            cursor: pointer;
            perspective: 900px;
            filter: drop-shadow(0 26px 30px rgba(0,0,0,.25));
            transform: translate(-50%, -50%);
            animation: mannheimer-float 4.2s ease-in-out infinite;
            transition:
                left 900ms cubic-bezier(.19,1,.22,1),
                top 900ms cubic-bezier(.19,1,.22,1),
                filter 450ms ease;
        }

        .mannheimer-coin::before {
            content: '';
            position: absolute;
            inset: -18%;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 225, 112, .38), rgba(255, 225, 112, .13) 34%, transparent 68%);
            opacity: .9;
            transform: scale(.98);
            animation: mannheimer-aura 2.4s ease-in-out infinite;
            pointer-events: none;
            z-index: -2;
        }

        .mannheimer-coin::after {
            content: 'Click';
            position: absolute;
            left: 50%;
            bottom: -2.45rem;
            transform: translateX(-50%);
            padding: .42rem .72rem;
            border-radius: 999px;
            background: rgba(255,255,255,.76);
            border: 1px solid rgba(60,50,20,.14);
            color: rgba(32,32,32,.62);
            font-size: .78rem;
            font-weight: 780;
            letter-spacing: .035em;
            text-transform: uppercase;
            box-shadow: 0 10px 28px rgba(0,0,0,.12);
            opacity: 1;
            transition: opacity 250ms ease, transform 250ms ease;
            pointer-events: none;
        }

        .mannheimer-coin:hover {
            filter:
                drop-shadow(0 28px 32px rgba(0,0,0,.25))
                drop-shadow(0 0 22px rgba(255, 213, 74, .46));
        }

        .mannheimer-half {
            position: absolute;
            top: 0;
            width: 50%;
            height: 100%;
            background-image: var(--mannheimer-coin-image);
            background-size: var(--coin-size) var(--coin-size);
            background-repeat: no-repeat;
            transition:
                transform 1050ms cubic-bezier(.19,1,.22,1),
                opacity 820ms ease,
                filter 900ms ease;
            backface-visibility: hidden;
            will-change: transform, opacity, filter;
        }

        .mannheimer-half-left {
            left: 0;
            background-position: left center;
            border-radius: var(--coin-size) 0 0 var(--coin-size);
            transform-origin: right center;
            z-index: 9;
        }

        .mannheimer-half-right {
            right: 0;
            background-position: right center;
            border-radius: 0 var(--coin-size) var(--coin-size) 0;
            transform-origin: left center;
            z-index: 5;
        }

        .mannheimer-printer-slot {
            position: absolute;
            left: 50%;
            top: 4%;
            height: 92%;
            width: 4px;
            border-radius: 999px;
            background: linear-gradient(to bottom, transparent, rgba(255,255,255,.98), rgba(70,60,30,.2), transparent);
            opacity: 0;
            transform: translateX(-50%) scaleY(.2);
            transform-origin: center;
            z-index: 12;
            transition: opacity 260ms ease, transform 420ms ease;
            pointer-events: none;
        }

        .mannheimer-flash {
            position: absolute;
            z-index: 7;
            inset: 8%;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,230,130,.34), transparent 62%);
            opacity: 0;
            transform: scale(.65);
            transition: opacity 320ms ease, transform 600ms cubic-bezier(.19,1,.22,1);
            pointer-events: none;
        }

        .mannheimer-print-viewport {
            position: absolute;
            left: calc(31% + var(--coin-size) * .16);
            top: 50%;
            width: var(--printed-width);
            transform: translateY(-50%);
            z-index: 7;
            overflow: hidden;
            pointer-events: none;
        }

        .mannheimer-printed-text {
            width: var(--printed-width);
            opacity: 0;
            transform: translateX(calc(var(--printed-width) * -1));
            transition:
                transform 1850ms cubic-bezier(.18,.88,.34,1) 560ms,
                opacity 320ms ease 560ms;
        }

        .mannheimer-kicker {
            display: inline-flex;
            align-items: center;
            gap: .48rem;
            margin-bottom: .85rem;
            padding: .4rem .68rem;
            border-radius: 999px;
            background: rgba(255,255,255,.72);
            border: 1px solid rgba(60,50,20,.16);
            color: rgba(32,32,32,.66);
            font-size: .78rem;
            font-weight: 780;
            letter-spacing: .04em;
            text-transform: uppercase;
        }

        .mannheimer-kicker::before {
            content: '';
            width: .55rem;
            height: .55rem;
            border-radius: 999px;
            background: #d5bf63;
            box-shadow: 0 0 0 4px rgba(213,191,99,.18);
        }

        .mannheimer-title {
            margin: 0 0 .8rem;
            font-size: clamp(1.9rem, 4.1vw, 3.85rem);
            line-height: .98;
            letter-spacing: -.055em;
            font-weight: 880;
            color: #f2f7ff;
            white-space: pre-line;
            text-wrap: balance;
            overflow-wrap: normal;
            word-break: normal;
        }

        .mannheimer-body {
            margin: 0;
            color: rgba(242,247,255,.72);
            font-size: clamp(1rem, 1.25vw, 1.12rem);
            line-height: 1.62;
            white-space: pre-line;
            overflow-wrap: break-word;
        }

        .mannheimer-shell.is-cutting .mannheimer-printer-slot {
            opacity: 1;
            transform: translateX(-50%) scaleY(1);
        }

        .mannheimer-shell.is-cutting .mannheimer-flash {
            opacity: 1;
            transform: scale(1);
        }

        .mannheimer-shell.is-open .mannheimer-coin {
            left: 31%;
            animation-play-state: paused;
        }

        .mannheimer-shell.is-open .mannheimer-coin::before {
            opacity: .42;
            animation-play-state: paused;
        }

        .mannheimer-shell.is-open .mannheimer-coin::after {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
        }

        .mannheimer-shell.is-open .mannheimer-half-left {
            transform: translateX(-8%) rotateY(-5deg) rotateZ(-.8deg);
            filter: brightness(.98);
        }

        .mannheimer-shell.is-open .mannheimer-half-right {
            transform: translateX(calc(var(--coin-size) * .62)) translateY(-18px) rotateY(16deg) rotateZ(8deg) scale(.86);
            opacity: 0;
            filter: blur(.2px) saturate(.76);
            pointer-events: none;
        }

        .mannheimer-shell.is-open .mannheimer-printed-text {
            opacity: 1;
            transform: translateX(0);
        }

        .mannheimer-shell.is-open .mannheimer-print-viewport {
            pointer-events: auto;
        }

        .mannheimer-shell.is-open .mannheimer-flash {
            opacity: 0;
        }

        .mannheimer-shell.is-closing .mannheimer-printed-text {
            opacity: 0;
            transform: translateX(calc(var(--printed-width) * -1));
            transition:
                transform 980ms cubic-bezier(.18,.88,.34,1) 80ms,
                opacity 420ms ease 560ms;
        }

        .mannheimer-shell.is-closing .mannheimer-half {
            transition-delay: 120ms;
        }

        @keyframes mannheimer-float {
            0%, 100% { translate: 0 0; rotate: -.35deg; }
            25% { translate: 0 -9px; rotate: .8deg; }
            50% { translate: 0 -4px; rotate: -.5deg; }
            75% { translate: 0 -12px; rotate: .45deg; }
        }

        @keyframes mannheimer-aura {
            0%, 100% { opacity: .68; transform: scale(.96); }
            50% { opacity: 1; transform: scale(1.07); }
        }

        @media (max-width: 760px) {
            .mannheimer-shell {
                --coin-size: min(300px, 76vw);
                --printed-width: min(86vw, 32rem);
                min-height: min(720px, 92svh);
            }

            .mannheimer-shell.is-open .mannheimer-coin {
                left: 50%;
                top: 32%;
            }

            .mannheimer-print-viewport {
                left: 50%;
                top: 68%;
                transform: translate(-50%, -50%);
                text-align: center;
            }

            .mannheimer-shell.is-open .mannheimer-half-right {
                transform: translateX(calc(var(--coin-size) * .52)) translateY(-16px) rotateY(16deg) rotateZ(8deg) scale(.84);
            }

            .mannheimer-coin::after {
                bottom: -2.25rem;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .mannheimer-coin,
            .mannheimer-coin::before {
                animation: none !important;
            }

            .mannheimer-half,
            .mannheimer-printer-slot,
            .mannheimer-flash,
            .mannheimer-printed-text,
            .mannheimer-coin,
            .mannheimer-coin::after {
                transition-duration: 1ms !important;
                transition-delay: 0ms !important;
            }
        }
    `;

    document.head.appendChild(style);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }[char]));
}

function getMountElement(target) {
    if (typeof target === 'string') return document.querySelector(target);
    return target;
}

export function initialisiereMannheimerAnimation(target = '#mannheimer-animation', options = {}) {
    if (typeof document === 'undefined') return null;

    const mount = getMountElement(target);
    if (!mount) return null;

    const opts = { ...DEFAULTS, ...options };
    installMannheimerStyles();

    const section = document.createElement('section');
    section.className = `mannheimer-shell ${opts.className || ''}`.trim();
    section.style.setProperty('--mannheimer-coin-image', `url("${opts.coinImage}")`);
    section.setAttribute('aria-label', 'Euro-Split-Animation');

    section.innerHTML = `
        <div class="mannheimer-coin" role="button" tabindex="0" aria-label="Animation öffnen oder schließen">
            <div class="mannheimer-half mannheimer-half-left"></div>
            <div class="mannheimer-half mannheimer-half-right"></div>
            <div class="mannheimer-printer-slot"></div>
            <div class="mannheimer-flash"></div>
        </div>

        <div class="mannheimer-print-viewport">
            <article class="mannheimer-printed-text">
                <div class="mannheimer-kicker">${escapeHTML(opts.kicker)}</div>
                <h2 class="mannheimer-title">${escapeHTML(opts.title)}</h2>
                <p class="mannheimer-body">${escapeHTML(opts.body)}</p>
            </article>
        </div>
    `;

    mount.replaceChildren(section);

    const coin = section.querySelector('.mannheimer-coin');
    let timers = [];
    let isOpen = false;
    let busy = false;

    function clearTimers() {
        timers.forEach(window.clearTimeout);
        timers = [];
    }

    function open() {
        if (busy || isOpen) return;
        busy = true;
        clearTimers();

        section.classList.remove('is-closing', 'is-cutting', 'is-open');
        void section.offsetHeight;

        timers.push(window.setTimeout(() => section.classList.add('is-cutting'), 80));
        timers.push(window.setTimeout(() => {
            section.classList.add('is-open');
            isOpen = true;
        }, 460));
        timers.push(window.setTimeout(() => section.classList.remove('is-cutting'), 1320));
        timers.push(window.setTimeout(() => { busy = false; }, 2550));
    }

    function close() {
        if (busy || !isOpen) return;
        busy = true;
        clearTimers();

        section.classList.add('is-closing');
        section.classList.remove('is-cutting');

        timers.push(window.setTimeout(() => {
            section.classList.remove('is-open');
            isOpen = false;
        }, 430));

        timers.push(window.setTimeout(() => {
            section.classList.remove('is-closing');
            busy = false;
        }, 1450));
    }

    function toggle() {
        if (isOpen) close();
        else open();
    }

    coin.addEventListener('click', toggle);
    coin.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
        }
    });

    return {
        element: section,
        open,
        close,
        toggle,
        destroy() {
            clearTimers();
            section.remove();
        },
    };
}

export default initialisiereMannheimerAnimation;
