<script lang="ts">
  import "fluent-svelte/theme.css";
  import {Button, Flyout, RadioButton, Slider, TextBlock, TextBox} from "fluent-svelte";

  const ctx = new AudioContext();

  const marks = ['', 'AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'B', 'CH', 'D', 'DH', 'EH', 'ER', 'EY', 'F', 'G',
         'HH', 'IH', 'IY', 'JH', 'K', 'L', 'M', 'N', 'NG', 'OW', 'OY', 'P', 'R', 'S', 'SH', 'T',
         'TH', 'UH', 'UW', 'V', 'W', 'Y', 'Z', 'ZH', 'sil', 'sp', 'spn'];

  let text = "";
  type AccentPhrase = {
    mark: string,
    stress: number,
    dur: number,
    pit: number,
    eng: number
  }
  type AccentItem = {
    word: string,
    marks: AccentPhrase[]
  }

  let audioStore: AccentItem[] = []
  let audio: AudioBuffer;
  let audioBuffer: ArrayBuffer;

  type PanelType = "dur" | "pit" | "eng";

  let curPanel: PanelType = "pit"

  const fetchAccentPhrase = async () => {
    let requestOptions: RequestInit = {
      method: 'GET',
      redirect: "follow",
    };

    let url = "/accent_phrases?" + "text=" + text

    fetch(url, requestOptions)
      .then(response => response.text())
      .then(result => audioStore = JSON.parse(result))
      .catch(error => console.log('error', error));
  }

  const changePhoneme = async (accent_phrases, idx:number) => {
    let data = JSON.stringify(accent_phrases);
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: data,
      redirect: 'follow'
    };
    const url = "/change_phoneme";
    fetch(url, requestOptions)
      .then(response => response.text())
      .then(result => {
        let newAudioStore = JSON.parse(result);
        audioStore[idx] = newAudioStore[idx];
        audioStore = audioStore;
      })
      .catch(error => console.log('error', error));
  }

  const synthesis = async () => {
    let data = JSON.stringify(audioStore);
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: data,
      redirect: 'follow'
    };

    const URL = "/synthesis?" +
                "pit_shift=" + pit_shift.toFixed(2) + "&" +
                "dur_scale=" + dur_scale.toFixed(2) + "&" +
                "eng_shift=" + eng_shift.toFixed(2)

    fetch(URL, requestOptions)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        audioBuffer = copy(arrayBuffer);
        return ctx.decodeAudioData(arrayBuffer)
      })
      .then(data => audio = data)
      .catch(error => console.log('error', error))
      .then(() => playSound())
  }

  const playSound = () => {
    const sound = ctx.createBufferSource();
    sound.buffer = audio;
    sound.connect(ctx.destination);
    sound.start(ctx.currentTime);
  }

  const downloadSound = () => {
    const blob = new Blob([audioBuffer]);
    saveFile(blob, text + ".wav")
  }

  const copy = (src) => {
    let dst = new ArrayBuffer(src.byteLength);
    new Uint8Array(dst).set(new Uint8Array(src));
    return dst;
  }

  function saveFile(blob, filename) {
    const a = document.createElement('a');
    document.body.appendChild(a);
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0)
  }

  document.addEventListener("keypress", (event: KeyboardEvent) => {
    const input = document.activeElement
    if (event.key == " " && !(input.id == "input") && input instanceof HTMLElement) {
      input.blur()
      synthesis()
    }
  })

  let shiftKeyFlag = 1;

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key == "Shift") {
      shiftKeyFlag = 0;
    }
  })

  document.addEventListener("keyup", (event: KeyboardEvent) => {
    if (event.key == "Shift") {
      shiftKeyFlag = 1;
    }
  })

  function handlePhonemeInput (e: any, i: number, j: number){
    const newPhoneme:string = e.target.value;

    if (newPhoneme == "") {
      audioStore[i].marks.splice(j,1);
      audioStore = audioStore;
      return;
    }

    const phonemes = newPhoneme.split(",");
    const newAccentItems = []
    let stress: null|number = null;
    for(let p=0; p< phonemes.length; p++){
      let phoneme = phonemes[p];
      let mark = "";
      if (phoneme.length >= 3 && phoneme != "spn"){
        mark = phoneme.slice(0, -1);
        stress = Number(phoneme.slice(-1));
      } else {
        mark = phoneme;
      }
      if (mark == ""){
        continue;
      }
      const accentItem:AccentPhrase = {
        mark: mark,
        stress: stress,
        pit: 0,
        dur: 0,
        eng: 0
      }
      newAccentItems.push(accentItem);
    }
    audioStore[i].marks.splice(j,1, ...newAccentItems);
    changePhoneme(audioStore, i);
  }

  let dur_scale = 1.0
  let pit_shift = 0
  let eng_shift = 0
</script>

<main>
  <div>
    <Button variant="accent" on:click={synthesis}>Play</Button>
    <Button on:click={fetchAccentPhrase}>Flush</Button>
    <input style="min-width: 50%;" id="input" bind:value={text}>
    <Button on:click={downloadSound}>Export</Button>
  </div>

  <div class="parent">
    <div class="div1">
      <RadioButton bind:group={curPanel} value="pit" style="margin: 0 0 0 30px">Pitch</RadioButton>
      <RadioButton bind:group={curPanel} value="dur" style="margin: 0 0 0 15px">Duration</RadioButton>
      <RadioButton bind:group={curPanel} value="eng" style="margin: 0 0 0 15px">Energy</RadioButton>
    </div>
    <div class="sliders">
      <Slider min={-0.5} max={0.5} step={0.01} tooltip={false} bind:value={pit_shift} on:wheel={(event) => pit_shift += 0.01 * -Math.sign(event.deltaY) * shiftKeyFlag} />
      <div style="margin: 5px">{pit_shift.toFixed(2)}</div>
      <div style="margin: 5px">Pitch Scale</div>
      <Slider min={0} max={2} step={0.01} tooltip={false} bind:value={dur_scale} on:wheel={(event) => dur_scale += 0.01 * -Math.sign(event.deltaY) * shiftKeyFlag}/>
      <div style="margin: 5px">{dur_scale.toFixed(2)}</div>
      <div style="margin: 5px">Duration Scale</div>
      <Slider min={-0.5} max={0.5} step={0.01} tooltip={false} bind:value={eng_shift} on:wheel={(event) => eng_shift += 0.01 * -Math.sign(event.deltaY) * shiftKeyFlag} />
      <div style="margin: 5px">{eng_shift.toFixed(2)}</div>
      <div style="margin: 5px">Energy Scale</div>
    </div>
    <div class="div2">
      {#each audioStore as audioItem, i}
        {#each audioItem.marks as marks, j}
          <div style="display: grid">
            <div style="block-size: 120px; margin-left:12px; margin-right: 12px">
              {#if curPanel === "pit"}
                <div style="margin-bottom: 5px">{marks.pit.toFixed(2)}</div>
                <Slider orientation="vertical" min={3.0} max={6.5} step={0.01} tooltip={false}
                        on:wheel={(event) => marks.pit += 0.01 * -Math.sign(event.deltaY) * shiftKeyFlag}
                        bind:value={marks.pit}/>
              {:else if curPanel === "dur"}
                <div style="margin-bottom: 5px">{marks.dur.toFixed(2)}</div>
                <Slider orientation="vertical" min={0} max={0.3} step={0.01} tooltip={false}
                        on:wheel={(event) => marks.dur += 0.01 * -Math.sign(event.deltaY) * shiftKeyFlag}
                        bind:value={marks.dur}/>
              {:else}
                <div style="margin-bottom: 5px">{marks.eng.toFixed(2)}</div>
                <Slider orientation="vertical" min={0} max={4} step={0.01} tooltip={false}
                        on:wheel={(event) => marks.eng += 0.01 * -Math.sign(event.deltaY) * shiftKeyFlag}
                        bind:value={marks.eng}/>
              {/if}
              <div>
                <Flyout placement="right">
                  <div style="cursor: pointer">
                    {#if marks.stress !== null}
                      {marks.mark + marks.stress}
                    {:else}
                      {marks.mark}
                    {/if}
                  </div>
                  <svelte:fragment slot="flyout">
                    <input value={marks.mark+(marks.stress==null? "":marks.stress)} on:change={(e)=>handlePhonemeInput(e, i, j)}/>
                  </svelte:fragment>
                </Flyout>
              </div>
            </div>
          </div>
        {/each}
        <div class="space"></div>
      {/each}
    </div>
  </div>

</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
    display: grid;
    gap: 10px;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  .parent {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    grid-column-gap: 0;
    grid-row-gap: 0;
  }

  .div1 {
    display: flex;
    grid-area: 1 / 1 / 2 / 2;
  }

  .div2 {
    grid-area: 2 / 1 / 6 / 6;
    display: flex;
    overflow: auto;
    border-top: 3px solid #ccc;
    min-height: 300px;
    padding: 15px;
  }

  .div2 .space {
    padding: 15px;
  }

  .sliders {
    grid-area: 1 / 2 / 2 / 5;
    display: flex;
    margin: 5px;
  }

  ::-webkit-scrollbar {
    width: 0; /* Remove scrollbar space */
    background: transparent; /* Optional: just make scrollbar invisible */
  }
</style>