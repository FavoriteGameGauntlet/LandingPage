<script setup lang="ts">
import {ref} from 'vue'

type TextBlock = { type: 'text'; paragraphs: string[] }
type VideoBlock = { type: 'video'; title: string; url: string; true?: boolean }
type ContentBlock = TextBlock | VideoBlock

interface Season {
  name: string
  link: string
  content: ContentBlock[]
}

const seasons: Season[] = [
  {
    name: 'FGG 2',
    link: 'https://docs.google.com/spreadsheets/d/1PvToVnWcyW4-3M2jDRuTFthg2ypbCfWyzqsp0HjATz4',
    content: []
  },
  {
    name: 'FGG 3',
    link: 'https://docs.google.com/spreadsheets/d/1Whmr71SdLHuleYlPSEndmsNmrjXzgXA5bykaHNaGJcg',
    content: []
  },
  {
    name: 'FGG 4',
    link: 'https://docs.google.com/spreadsheets/d/10qmqTpqhvLj5UVXEshyM2G7Bm1OSwGvUJib-UkgPUd0',
    content: []
  },
  {
    name: 'FGG 5',
    link: 'https://docs.google.com/spreadsheets/d/1WXjNhHQZdE9hOCGOE0dHQcWQs_1oTgIv6-EyjOzUQ18',
    content: []
  },
  {
    name: 'FGGW 1',
    link: 'https://docs.google.com/spreadsheets/d/1n9GQN-BfXG1raE17xQP0ja9vqb52AgSfs3YGxq1od80',
    content: [
      {
        type: 'text',
        paragraphs: [
          'Состав: Стас (Билли, клан «Flex Machine»), Дима (Пик, клан «Ханна-Монтана»), ' +
          'Терентий (Вуди, клан «Розовый негатив»), Даня (Кабан, клан «Шаманские Веды»), ' +
          'Паша (Ле\'нтакле Няшмяш, клан «Жертвы удачи»), Влодес (Гигачмонстрик, клан «Уберчуханы»), ' +
          'Егор (Диксмоук, клан «Карабасские Гиперборейцы»), Вова (Боба Фурриеб, клан «Пушистые ублюдки»)',

          'События первого сезона берут свое начало в разгар клановых войн. ' +
          'Кланы «Flex Machine», «Ханна-Монтана», «Розовый негатив», «Шаманские Веды», ' +
          '«Жертвы удачи», «Уберчуханы», «Карабасские Гиперборейцы» и их лидеры борются друг с другом, ' +
          'устраивая террор на улицах города FGG-сити, за право называться единоличным правителем, ' +
          'продвигаясь с окраин к центру и занимая территории.',

          'Захватывая территории, они сталкиваются с различными ситуациями, требующими их незамедлительного ' +
          'вмешательства. Решая эти ситуации, каждый из лидеров кланов знакомится с разработчиком игр ' +
          'Готом Товарддом, пытающимся создать хит на все времена, что пока у него не очень выходит. ' +
          'В ходе квестов с этим персонажем игрокам предстояло поиграть в некоторые из его игр.',

          'В самый разгар войны, после первой недели, из гонки выходит Диксмоук. Бесследно пропав, ' +
          'клан «Карабасские Гиперборейцы» оказывается разобщен без своего лидера и теряет свое ' +
          'влияние в городе. Никто не знает, куда он исчез.',

          'В ходе ожесточенных боев второй недели из гонки выходит Гигачмонстрик, конкретно заебавшись ' +
          'и заебав всех, его клан ждет та же участь, что и «Карабасских Гиперборейцев».',

          'Параллельно прошлому событию глава клана «Flex Machine» Билли захватывает телевышку ' +
          '«Недобитый близнец», в которой происходит взлом, и с ним связывается некое высшее существо, ' +
          'именующее себя Ядром. Оно сообщает Билли о том, что конечной целью всех лидеров кланов ' +
          'является высотка в центре города, где находится Ядро, и просит его, встав перед выбором, ' +
          'убедить других лидеров уничтожить Ядро, что повлечет за собой и уничтожение всего FGG-сити.',

          'Однако попасть в высотку не так просто. Ядро сообщает местоположение 5-ти ключ-карт на ' +
          'карте города, которые необходимо собрать, объединив усилия, чтобы открыть дверь внутрь.',

          'В это же время в город въезжает новый влиятельный лидер клана «Пушистые ублюдки» Боба Фурриеб, ' +
          'однако, продержавшись всего 20 минут, он покидает город, осознав, что забыл свой фурсьют.',

          'Билли очень доходчиво объясняет всем лидерам кланов, что им необходимо временно объединиться ' +
          'ради общей цели, и сообщает им местоположения ключ-карт, утаивая, что уничтожение Ядра ' +
          'приведет к разрушению города.',

          'Ему удается объединить кланы, и вся третья и четвертая неделя были посвящены поискам ' +
          'ключ-карт и захвату Ядра.',

          'Оказавшись перед высоткой, лидеры оставшихся кланов прикладывают ключ-карты к ее двери ' +
          'и попадают внутрь, увидев ужасающую картину — весь персонал башни мертв. Они поднимаются ' +
          'на последний этаж и находят суперкомпьютер. Теперь уже Ядро связывается со всеми и сообщает ' +
          'им о своих намерениях уничтожить себя и город.',
        ]
      },
      {type: 'video', title: 'Финальный выбор', url: '/videos/fggw1-final-choice.mp4', true: true},
      {
        type: 'text',
        paragraphs: [
          'В ходе горячего спора Ядру и Билли не удается убедить других лидеров кланов уничтожить ' +
          'город, и они решают перепрограммировать Ядро, став абсолютными правителями и поделив ' +
          'FGG-сити между собой, однако реализовать их план было не суждено — все это оказывается ловушкой.',

          'Оказывается, все это время в башне уже находился Диксмоук. Он при помощи силы Ядра останавливает ' +
          'их, и становится ясно, что оно уже находится под его контролем. Он сообщает, что, несмотря на то, ' +
          'что Ядро действительно разумно, оно уже находится под его контролем с тех самых пор, когда впервые ' +
          'связалось с Билли, и все это было лишь для того, чтобы собрать их всех вместе и разом разобраться ' +
          'со всеми.',

          'Он убежден, что тем способом, который выбрали лидеры кланов, невозможно остановить войны на ' +
          'улицах, что рано или поздно это вновь приведет к новым, уже более масштабным столкновениям.',

          'Находясь под контролем Диксмоука, Билли, Пик, Вуди, Кабан, Ле\'нтакле Няшмяш теряют сознание, ' +
          'а он становится единственным правителем FGG-сити.',

          'Что касается других персонажей — Гигачмонстрик попадает в рабство к Диксмоуку, ' +
          'Боба больше в город не возвращался, а Гот Товардд наконец выпускает свою самую успешную игру.',
        ]
      },
      {type: 'video', title: 'Финал: Перепрограммирование', url: '/videos/fggw1-reprogramming-final.mp4', true: true},
      {type: 'video', title: 'Финал: Самоуничтожение', url: '/videos/fggw1-self-destruction-final.mp4'}
    ]
  },
  {
    name: 'FGGW 2',
    link: 'https://docs.google.com/spreadsheets/d/1z-oFb87xGjrXHSoe2FvMNVC5RSMTY3T3Q6PGfu-xD8U',
    content: [
      {type: 'video', title: 'Интро', url: '/videos/fggw2-intro.mp4', true: true},
      {type: 'video', title: 'Конец первого акта', url: '/videos/fggw2-first-act-ending.mp4', true: true},
      {type: 'video', title: 'Финал', url: '/videos/fggw2-fake-final.mp4'},
      {type: 'video', title: 'Финал', url: '/videos/fggw2-final.mp4', true: true}
    ]
  }
]

const openSet = ref(new Set<number>())

function toggle(index: number) {
  if (openSet.value.has(index)) {
    openSet.value.delete(index)
  } else {
    openSet.value.add(index)
  }
  openSet.value = new Set(openSet.value)
}
</script>

<template>
  <h1>Предыдущие сезоны</h1>
  <div class="seasons">
    <div v-for="(season, index) in seasons" :key="season.name" class="season">
      <button class="season-header" :class="{ open: openSet.has(index) }" @click="toggle(index)">
        <span>{{ season.name }}</span>
        <span class="chevron">▾</span>
      </button>
      <div class="season-body" :class="{ open: openSet.has(index) }">
        <a :href="season.link" target="_blank" class="season-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Таблица сезона
        </a>
        <div class="content">
          <template v-for="(block, bi) in season.content" :key="bi">
            <div v-if="block.type === 'text'" class="text-block">
              <p v-for="(para, pi) in block.paragraphs" :key="pi">{{ para }}</p>
            </div>
            <div v-else class="video-item">
              <p class="video-caption">
                {{ block.title }}
                <span v-if="block.true" class="tag-true">Канон</span>
              </p>
              <div class="video-wrapper">
                <video controls preload="none" :src="block.url"></video>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seasons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.season-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgb(from var(--color-accent-blue) r g b / 0.3);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.season-header:hover {
  background: rgb(from var(--color-accent-blue) r g b / 0.5);
}

.season-header.open {
  border-bottom-color: transparent;
  background: rgb(from var(--color-accent-purple) r g b / 0.4);
}

.chevron {
  display: inline-block;
  transition: transform 0.25s ease;
  font-size: 1.2em;
  line-height: 1;
}

.season-header.open .chevron {
  transform: rotate(-180deg);
}

.season-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
  border: 1px solid var(--color-border);
  border-top: none;
}

.season-body.open {
  max-height: 10000px;
}

.season-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 16px;
  padding: 8px 16px;
  font-size: 0.9em;
  font-weight: 600;
  border: 1px solid var(--color-accent-cyan);
  color: var(--color-accent-cyan);
  background: rgb(from var(--color-accent-cyan) r g b / 0.08);
  transition: background 0.2s, color 0.2s;
}

.season-link:hover {
  background: rgb(from var(--color-accent-cyan) r g b / 0.2);
  color: var(--color-accent-cyan);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 16px 16px;
}

.text-block p {
  margin: 0 0 12px;
  line-height: 1.7;
  color: var(--color-text);
}

.text-block p:last-child {
  margin-bottom: 0;
}

.video-caption {
  margin: 0 0 8px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-true {
  font-size: 0.75em;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgb(from var(--color-accent-purple) r g b / 0.3);
  border: 1px solid var(--color-accent-purple);
  color: var(--color-text);
}

.video-wrapper video {
  width: 100%;
  max-height: 480px;
  display: block;
}
</style>
