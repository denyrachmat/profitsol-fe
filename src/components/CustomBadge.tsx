import { Box, IconButton } from '@chakra-ui/react';
import { css } from '@emotion/react';
import { BellIcon } from '@chakra-ui/icons';

const CustomBadge = ({ count }: { count: number }) => {
    return (
        <IconButton
            variant={'ghost'}
            css={css`
              position: relative !important;
            `}
            py={'2'}
            colorScheme={'gray'}
            aria-label={'Notifications'}
            size={'lg'}
            icon={<>
                <BellIcon color={'gray.750'} />
                <Box as={'span'} color={'white'} position={'absolute'} top={'6px'} right={'4px'} fontSize={'0.8rem'}
                     bgColor={'red'} borderRadius={'llg'} zIndex={9999} p={'1px'}>
                    {count}
                </Box>
            </>}
        />
    );
}

export default CustomBadge