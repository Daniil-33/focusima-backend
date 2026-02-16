// Unit тесты для AccessRuleConditionFactory
import { AccessRuleConditionFactory } from './access-rule-condition.factory';
import { AccessRuleListCondition } from '../../core/entities/access-control/rules/condition/access-rule-list-condition';
import { AccessRuleRegexCondition } from '../../core/entities/access-control/rules/condition/access-rule-regex-condition';
import { AccessRuleType } from '../../core/entities/access-control/rules/condition/access-rule-match-condition';

describe('AccessRuleConditionFactory', () => {
    let factory: AccessRuleConditionFactory;

    beforeEach(() => {
        factory = new AccessRuleConditionFactory();
    });

    describe('createFromDto', () => {
        describe('List Condition', () => {
            it('should create List condition with valid values', () => {
                // Arrange
                const dto = {
                    type: 'List' as const,
                    data: {
                        values: ['google.com', 'youtube.com', 'facebook.com'],
                    },
                };

                // Act
                const result = factory.createFromDto(dto);

                // Assert
                expect(result).toBeInstanceOf(AccessRuleListCondition);
                expect(result.type).toBe(AccessRuleType.List);
                expect(result.matches('google.com')).toBe(true);
                expect(result.matches('youtube.com')).toBe(true);
                expect(result.matches('unknown.com')).toBe(false);
            });

            it('should throw error when values array is empty', () => {
                // Arrange
                const dto = {
                    type: 'List' as const,
                    data: {
                        values: [],
                    },
                };

                // Act & Assert
                expect(() => factory.createFromDto(dto)).toThrow(
                    'List condition requires at least one value',
                );
            });

            it('should throw error when values is undefined', () => {
                // Arrange
                const dto = {
                    type: 'List' as const,
                    data: {},
                };

                // Act & Assert
                expect(() => factory.createFromDto(dto)).toThrow(
                    'List condition requires at least one value',
                );
            });
        });

        describe('Regex Condition', () => {
            it('should create Regex condition with valid pattern', () => {
                // Arrange
                const dto = {
                    type: 'Regex' as const,
                    data: {
                        pattern: '^.*\\.ru$',
                    },
                };

                // Act
                const result = factory.createFromDto(dto);

                // Assert
                expect(result).toBeInstanceOf(AccessRuleRegexCondition);
                expect(result.type).toBe(AccessRuleType.Regex);
                expect(result.matches('yandex.ru')).toBe(true);
                expect(result.matches('mail.ru')).toBe(true);
                expect(result.matches('google.com')).toBe(false);
            });

            it('should create Regex condition for social media domains', () => {
                // Arrange
                const dto = {
                    type: 'Regex' as const,
                    data: {
                        pattern: '^(facebook|twitter|instagram)\\.com$',
                    },
                };

                // Act
                const result = factory.createFromDto(dto);

                // Assert
                expect(result.matches('facebook.com')).toBe(true);
                expect(result.matches('twitter.com')).toBe(true);
                expect(result.matches('instagram.com')).toBe(true);
                expect(result.matches('linkedin.com')).toBe(false);
            });

            it('should throw error when pattern is empty', () => {
                // Arrange
                const dto = {
                    type: 'Regex' as const,
                    data: {
                        pattern: '',
                    },
                };

                // Act & Assert
                expect(() => factory.createFromDto(dto)).toThrow(
                    'Regex condition requires a pattern',
                );
            });

            it('should throw error when pattern is whitespace only', () => {
                // Arrange
                const dto = {
                    type: 'Regex' as const,
                    data: {
                        pattern: '   ',
                    },
                };

                // Act & Assert
                expect(() => factory.createFromDto(dto)).toThrow(
                    'Regex condition requires a pattern',
                );
            });

            it('should throw error when pattern is undefined', () => {
                // Arrange
                const dto = {
                    type: 'Regex' as const,
                    data: {},
                };

                // Act & Assert
                expect(() => factory.createFromDto(dto)).toThrow(
                    'Regex condition requires a pattern',
                );
            });
        });

        describe('Unknown Type', () => {
            it('should throw error for unknown condition type', () => {
                // Arrange
                const dto = {
                    type: 'Unknown' as any,
                    data: {},
                };

                // Act & Assert
                expect(() => factory.createFromDto(dto)).toThrow('Unknown condition type');
            });
        });
    });

    describe('Integration scenarios', () => {
        it('should create multiple conditions independently', () => {
            // Arrange
            const listDto = {
                type: 'List' as const,
                data: { values: ['site1.com'] },
            };
            const regexDto = {
                type: 'Regex' as const,
                data: { pattern: '.*\\.com$' },
            };

            // Act
            const listCondition = factory.createFromDto(listDto);
            const regexCondition = factory.createFromDto(regexDto);

            // Assert
            expect(listCondition).toBeInstanceOf(AccessRuleListCondition);
            expect(regexCondition).toBeInstanceOf(AccessRuleRegexCondition);
            expect(listCondition.type).not.toBe(regexCondition.type);
        });

        it('should handle complex regex patterns', () => {
            // Arrange
            const dto = {
                type: 'Regex' as const,
                data: {
                    // Match URLs with https and specific domains
                    pattern: '^https?://(www\\.)?(google|youtube)\\.com(/.*)?$',
                },
            };

            // Act
            const result = factory.createFromDto(dto);

            // Assert
            expect(result.matches('https://google.com')).toBe(true);
            expect(result.matches('http://www.youtube.com/watch')).toBe(true);
            expect(result.matches('https://facebook.com')).toBe(false);
        });

        it('should handle List with single value', () => {
            // Arrange
            const dto = {
                type: 'List' as const,
                data: {
                    values: ['single-site.com'],
                },
            };

            // Act
            const result = factory.createFromDto(dto);

            // Assert
            expect(result.matches('single-site.com')).toBe(true);
            expect(result.matches('other-site.com')).toBe(false);
        });
    });
});
