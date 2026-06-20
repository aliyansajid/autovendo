import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from "@nestjs/common";
import type { ZodType } from "zod";

/**
 * Validates (and coerces) a request body against a Zod schema at the controller
 * boundary. On failure it returns a 400 with the first offending field, e.g.
 * `Validation failed for "registrationMonth": ...`.
 *
 * Usage: `@Body(new ZodValidationPipe(createVehicleSchema)) body: ...`
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const first = result.error.issues[0];
      const path = first?.path.join(".") || "input";
      throw new BadRequestException(
        `Validation failed for "${path}": ${first?.message ?? "invalid value"}`,
      );
    }
    return result.data;
  }
}
