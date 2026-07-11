import { IsEnum } from 'class-validator';
import { Plan } from '../../generated/prisma/enums';

export class UpdatePlanDto {
  @IsEnum(Plan)
  plan!: Plan;
}
