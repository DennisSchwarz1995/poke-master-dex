import os

file_path = 'src/app/features/pokedex/pokemon-edit-dialog/pokemon-edit-dialog.component.ts'
with open(file_path, 'r') as f:
    content = f.read()

# Replace the HTML block
start_idx = content.find('<div class="flex-1 overflow-y-auto custom-scrollbar p-6">')
end_idx = content.find('<div class="p-6 pt-4 border-t border-theme flex-none bg-surface z-10">')

new_html = """<div class="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div class="flex flex-col gap-[18px]">
                <app-pokemon-edit-attributes
                  [pokemonData]="pokemonData()"
                  [isOwned]="isOwned"
                  [isShiny]="isShiny"
                  [isEvent]="isEvent"
                  [isGmax]="isGmax"
                  [isAlpha]="isAlpha"
                  [level]="level"
                  [languageOptions]="languageOptions()"
                  [originLanguage]="originLanguage"
                  [genderState]="genderState()"
                  [gender]="gender"
                  [pokeballOptions]="pokeballOptions()"
                  [ball]="ball"
                  [itemOptions]="itemOptions()"
                  [item]="item"
                  [abilityOptions]="abilityOptions()"
                  [ability]="ability"
                  [currentAbilityDescription]="currentAbilityDescription"
                  [natureOptions]="natureOptions()"
                  [nature]="nature"
                  [ribbonOptions]="ribbonOptions()"
                  [ribbon]="ribbon"
                  [markOptions]="markOptions()"
                  [mark]="mark"
                  [trainerOptions]="trainerOptions()"
                  [originalTrainer]="originalTrainer"
                  [trainerId]="trainerId"
                  [originGameOptions]="originGameOptions()"
                  [originGame]="originGame"
                  [notes]="notes"
                  (isOwnedChanged)="isOwned = $event; onCaughtChange()"
                  (isShinyChanged)="isShiny = $event; updateSpritePreview()"
                  (isEventChanged)="isEvent = $event"
                  (isGmaxChanged)="isGmax = $event"
                  (isAlphaChanged)="isAlpha = $event"
                  (levelChanged)="level = $event"
                  (originLanguageChanged)="originLanguage = $event"
                  (genderChanged)="gender = $event"
                  (ballChanged)="ball = $event"
                  (itemChanged)="item = $event"
                  (abilityChanged)="onAbilityChange($event)"
                  (natureChanged)="nature = $event"
                  (ribbonChanged)="ribbon = $event"
                  (markChanged)="mark = $event"
                  (trainerSelected)="onTrainerSelect($event)"
                  (originalTrainerChanged)="originalTrainer = $event"
                  (trainerIdChanged)="trainerId = $event"
                  (originGameChanged)="onOriginGameChange($event)"
                  (notesChanged)="notes = $event"
                ></app-pokemon-edit-attributes>
              </div>
              <div class="flex flex-col gap-[18px]">
                <app-pokemon-edit-stats
                  [ivs]="ivs"
                  [evs]="evs"
                  (ivsChanged)="ivs = $event"
                  (evsChanged)="evs = $event"
                ></app-pokemon-edit-stats>
              </div>
            </div>
          </div>

          """

content = content[:start_idx] + new_html + content[end_idx:]

with open(file_path, 'w') as f:
    f.write(content)
