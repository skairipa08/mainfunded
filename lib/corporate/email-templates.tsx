import * as React from 'react';
import {
  Html,
  Body,
  Container,
  Heading,
  Text,
  Section,
} from '@react-email/components';

type Props80 = {
  companyName: string;
  periodKey: string;
  spentTRY: number;
  limitTRY: number;
};

export function BudgetThreshold80Email(props: Props80) {
  const { companyName, periodKey, spentTRY, limitTRY } = props;
  return (
    <Html>
      <Body>
        <Container>
          <Heading>Bütçenizin %80&apos;i kullanıldı</Heading>
          <Section>
            <Text>Sayın {companyName} yetkilisi,</Text>
            <Text>
              {periodKey} dönemi için belirlediğiniz {limitTRY.toLocaleString('tr-TR')} TL aylık eşleştirme bütçesinin
              %80&apos;i ({spentTRY.toLocaleString('tr-TR')} TL) kullanılmıştır.
            </Text>
            <Text>
              Yeni eşleştirmeler bütçe tükenene kadar normal şekilde işlenecektir. Limit dolduğunda
              ek eşleştirme yapılmayacaktır.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

type PropsReached = {
  companyName: string;
  periodKey: string;
  limitTRY: number;
};

export function BudgetThresholdReachedEmail(props: PropsReached) {
  const { companyName, periodKey, limitTRY } = props;
  return (
    <Html>
      <Body>
        <Container>
          <Heading>Aylık eşleştirme bütçeniz tükendi</Heading>
          <Section>
            <Text>Sayın {companyName} yetkilisi,</Text>
            <Text>
              {periodKey} dönemi için {limitTRY.toLocaleString('tr-TR')} TL aylık bütçeniz tamamen kullanılmıştır.
              Bu ay yapılacak yeni bağışlar eşleştirme programınıza dahil edilmeyecektir.
            </Text>
            <Text>Bütçe bir sonraki ayın başında otomatik olarak yenilenecektir.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
