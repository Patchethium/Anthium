<script lang="ts">
  import "fluent-svelte/theme.css";
  import {Button, RadioButton, Slider} from "fluent-svelte";

  export let name: string;

  const ctx = new AudioContext();

  let text = "Hello, world!";
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

    fetch("/synthesis", requestOptions)
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

  document.addEventListener("keypress", (event: KeyboardEvent)=>{
    const input = document.activeElement
    if (event.key == " " && !(input.id == "input")){
      synthesis()
    }
  })
</script>

<main>
  <div>
    <Button variant="accent" on:click={synthesis}>Play</Button>
    <Button on:click={fetchAccentPhrase}>Flush</Button>
    <input id="input" bind:value={text}>
    <Button on:click={downloadSound}>Export</Button>
  </div>

  <div class="parent">
    <div class="div1">
      <RadioButton bind:group={curPanel} value="pit" style="margin: 0 0 0 15px">Pitch</RadioButton>
      <RadioButton bind:group={curPanel} value="dur" style="margin: 0 0 0 15px">Duration</RadioButton>
      <RadioButton bind:group={curPanel} value="eng" style="margin: 0 0 0 15px">Energy</RadioButton>
    </div>
    <div class="div2">
      {#each audioStore as audioItem}
        {#each audioItem.marks as marks}
          <div style="display: grid">
            <div style="block-size: 120px; margin:40px 12px 12px 12px">
              {#if curPanel === "pit"}
                <Slider orientation="vertical" min={0} max={6.5} step={0.01} bind:value={marks.pit}/>
              {:else if curPanel === "dur"}
                <Slider orientation="vertical" min={0} max={0.3} step={0.001} bind:value={marks.dur}/>
              {:else}
                <Slider orientation="vertical" min={0} max={4} step={0.01} bind:value={marks.eng}/>
              {/if}
            </div>
            <div style="margin-bottom: 10px">{marks.mark}</div>
          </div>
        {/each}
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
    grid-area: 1 / 1 / 2 / 3;
    border-radius: 15px 15px 0 0;
    border: 3px solid #ccc;
    border-bottom: 0;
  }

  .div2 {
    grid-area: 2 / 1 / 6 / 6;
    display: flex;
    overflow: auto;
    border: 3px solid #ccc;
    min-height: 200px;
  }
</style>