import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateTaggedActionDto } from './create-tagged-action.dto';

export class CreateSessionActionsDto {
  @IsArray({ message: 'Ações devem ser enviadas em uma lista' })
  @ArrayMinSize(1, { message: 'Informe ao menos uma ação' })
  @ArrayMaxSize(1000, { message: 'O lote deve ter no máximo 1000 ações' })
  @ValidateNested({ each: true })
  @Type(() => CreateTaggedActionDto)
  actions!: CreateTaggedActionDto[];
}
